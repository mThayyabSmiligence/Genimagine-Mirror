require("dotenv").config({ path: require("path").resolve(__dirname, "../config.env") });
const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { printNumbers, extractScenesAndCharactersService } = require("../service/AutoStoryService");

const { getStoryById } = require("../service/StoryService");
const Style = require("../models/Style");
const { fullCharacterDescriptionGenerateService, createCharacterImageGeneratePrompt } = require("../service/CharacterService");
const Character = require("../models/Character");
const generateStabilityAiImage = require("../API/StabilityAiImage");
const { uploadImageToServer } = require("../service/UploadToServerService");
const { generateSceneService } = require("../service/SceneService");
const { generateImage } = require("../API/CloudFlare.api");
const { Story } = require("../models");







module.exports = (connection) =>{ 
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
            throw new Error("Failed to update story status");
        }

        
        const style = await Style.findOne({ where: { id: story.style_id } }).catch(err => {
            console.error("Error fetching style:", err);
            throw new Error("Failed to fetch style");
        });

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

        console.log("parsedPrompt:",parsedPrompt);


        if (!parsedPrompt.success || !parsedPrompt.data.characters || !parsedPrompt.data.scenes) {
            throw new Error("Failed to parse prompt");
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
                // const characterImage = await generateStabilityAiImage(characterPrompt).catch(err => {
                //     console.error("Error generating image:", err);
                //     return null;
                // });
                const characterImage = await generateImage(characterPrompt,1024,1024).catch(err => {
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
            throw err;
          }

          story.generated_scenes = story.generated_scenes + 1;
          await story.save().catch(err => console.error("Failed to update story scenes:", err));
        } catch (err) {
          throw new Error("Failed to generate scene");
        }
      }

      //uuser corn job to update the status the its failed here 
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
      throw err;
    }
  },
  { connection, concurrency: 10 }
);



worker.on("completed", job => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed",async (job, err) => {
    console.log(`Job ${job.id} failed: ${err.message}`);
    
    // Access job data to update database
    const { storyId, userId } = job.data;
    
    try {
        // Update story status in database
        const story = await Story.findOne({ 
            where: { id: storyId, user_id: userId } 
        });
        
        if (story) {
            story.status = "failed";
            story.error_message = err.message; // Optional: store error details
            await story.save();
            console.log(`Story ${storyId} marked as failed in database`);
        }
    } catch (dbError) {
        console.error(`Failed to update story status in DB:`, dbError);
        // This is a critical error - consider alerting/monitoring
    }
});

worker.on('error',async (job, err) => {
    console.log(`Job ${job.id} error: ${err.message}`);
    
    // Access job data to update database
    const { storyId, userId } = job.data;
    
    try {
        // Update story status in database
        const story = await Story.findOne({ 
            where: { id: storyId, user_id: userId } 
        });
        
        if (story) {
            story.status = "failed";
            story.error_message = err.message; // Optional: store error details
            await story.save();
            console.log(`Story ${storyId} marked as failed in database`);
        }
    } catch (dbError) {
        console.error(`Failed to update story status in DB:`, dbError);
        // This is a critical error - consider alerting/monitoring
    }
});

}