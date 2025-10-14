require("dotenv").config({ path: require("path").resolve(__dirname, "../config.env") });
const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { printNumbers, extractScenesAndCharactersService } = require("../service/AutoStoryService");

const { sequelize } = require("../models");
const { getStoryById } = require("../service/StoryService");
const Style = require("../models/Style");
const { fullCharacterDescriptionGenerateService, createCharacterImageGeneratePrompt } = require("../service/CharacterService");
const Character = require("../models/Character");
const generateStabilityAiImage = require("../API/StabilityAiImage");
const { uploadImageToServer } = require("../service/UploadToServerService");
const { generateSceneService } = require("../service/SceneService");



console.log("Loaded ENV values:");
console.log("HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("USER:", process.env.DB_USER);
console.log("PASSWORD:", process.env.DB_PASSWORD);
console.log("DATABASE:", process.env.DATABASE);


// const sequalize = require("../config/database");


const redis_url = process.env.REDIS_URL;
console.log(redis_url,"give")

const connection = new IORedis(redis_url,{
    tls:{},
    maxRetriesPerRequest: null,
});

sequelize.authenticate()
  .then(() => console.log("✅ Sequelize connected"))
  .catch(err => console.error("❌ Sequelize error: ", err));

sequelize.sync({ alter: false })  
  .then(() => console.log("✅ Sequelize models are synced"))
  .catch(err => console.error("❌ Sequelize sync error: ", err));

const worker = new Worker(
  "autoStoryQueue",
  async (job) => {
    console.log(`Job ${job.id} started`);

    let story;
    try {
        const { storyId, userId } = job.data;

        
        const storyResponse = await getStoryById(storyId, userId).catch(err => {
            console.error("Error fetching story:", err);
            return { success: false };
        });
        if (!storyResponse?.success) return;
        story = storyResponse.story;


        try {
            story.status = "in-progress";
            await story.save();
        } catch (err) {
            console.error("Failed to set story in-progress:", err);
            return;
        }

        
        const style = await Style.findOne({ where: { id: story.style_id } }).catch(err => {
            console.error("Error fetching style:", err);
            return null;
        });
        if (!style) return;

        let extactCount = 0;
        let parsedPrompt = { success: false };
        let extractFlag = true;
        while (extractFlag) {
            extractFlag = false;
            if(extactCount > 0) {
                console.log("Retrying to parse prompt");
            }
            parsedPrompt = await extractScenesAndCharactersService(
                story.description,
                story.total_scenes
            ).catch(err => {
                console.error("Error parsing prompt:", err);
                return { success: false };
            });
            extractFlag = !parsedPrompt.success || !parsedPrompt.data.characters || !parsedPrompt.data.scenes;
            extactCount++;
        }


        if (!parsedPrompt.success || !parsedPrompt.data.characters || !parsedPrompt.data.scenes) {
            console.log("Failed to parse prompt");
            story.status = "failed";
            await story.save();
            return;
        }


        for (let baseCharacter of parsedPrompt.data.characters) {
            try {
                
                story.status = "generating-characters";
                await story.save();
            
                const fullDescription = await fullCharacterDescriptionGenerateService(
                    baseCharacter.description,
                    style.name
                );
                if (!fullDescription.success) throw new Error("Description generation failed");

                const character = await Character.create({
                    user_id: userId,
                    story_id: storyId,
                    name: baseCharacter.name,
                    description: baseCharacter.description,
                    full_description: fullDescription.description,
                });

                const characterPrompt = createCharacterImageGeneratePrompt(character, style.name);
                const characterImage = await generateStabilityAiImage(characterPrompt).catch(err => {
                    console.error("Error generating image:", err);
                    return null;
                });


                let uploadImage = { success: false };
                if (characterImage) {
                    uploadImage = await uploadImageToServer(
                    characterImage,
                    userId,
                    null,
                    character.id,
                    "character"
                    ).catch(err => {
                    console.error("Error uploading image:", err);
                    return { success: false };
                    });
                }

                if (!uploadImage.success) character.status = "failed";
                else {
                    character.image_url = uploadImage.imageUrl;
                    character.image_path = uploadImage.imagePath;
                    character.status = "completed";
                }

                await character.save().catch(err =>
                    console.error("Failed to save character:", err)
                );
            } catch (err) {
                console.error("Character generation error:", err);
            }
        }


      for (let scene of parsedPrompt.data.scenes) {
        try {
          story.status = "generating-scenes";
          await story.save();
          const result = await generateSceneService(
            userId,
            storyId,
            scene.prompt,
            scene.scene_number
          );

          if (!result.success) {
            console.log("Failed to generate scene");
          }

          story.generated_scenes = story.generated_scenes + 1;
          await story.save().catch(err => console.error("Failed to update story scenes:", err));
        } catch (err) {
          console.error("Scene generation error:", err);
        }
      }

      
      try {
        story.status =
          story.generated_scenes === story.total_scenes
            ? "completed"
            : "partially-completed";
        await story.save();
      } catch (err) {
        console.error("Error saving final story status:", err);
      }
    } catch (err) {

      console.error("Unexpected worker error:", err);
      if (story) {
        story.status = "failed";
        await story.save().catch(() => {});
      }
    }
  },
  { connection, concurrency: 10 }
);

worker.on("completed", job => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.log(`Job ${job.id} failed: ${err.message}`);
});