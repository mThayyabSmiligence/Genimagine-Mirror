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
const { Story, Scene } = require("../models");







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

        let parsedPrompt = story.parsed_prompt || { success: false };
        const style = await Style.findOne({ where: { id: story.style_id } }).catch(err => {
              console.error("Error fetching style:", err);
              throw new Error("Failed to fetch style");
        });

        if(story.status=="started"){
          try {
              story.status = "in-progress";
              await story.save();
              // throw err;
          } catch (err) {
              throw new Error("Failed to update story status");
          }

          
          

          let extactCount = 0;
          let extractFlag = true;
          let MAX_EXTRACT_ATTEMPTS=5
          while (extractFlag && extactCount<MAX_EXTRACT_ATTEMPTS) {
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

          story.parsed_prompt = parsedPrompt;
          await story.save();
        }

        if(story.status=="in-progress"||story.status=="generating-characters"){
          
          story.status = "generating-characters";
          const characters = await Character.findAll({ where: { story_id: storyId } }).catch(err => {
              console.error("Error fetching characters:", err);
              return [];
          })
          await story.save();
          for (let baseCharacter of parsedPrompt.data.characters) {
              try {
                  let character=characters.find(character => character.name == baseCharacter.name);
                  if( character&& character.status=="completed") continue;
              
                  if(!character){

                    const fullDescription = await fullCharacterDescriptionGenerateService(
                        baseCharacter.description,
                        style.name
                    );
                    if (!fullDescription.success) throw new Error("Description generation failed");
  
                    character = await Character.create({
                        user_id: userId,
                        story_id: storyId,
                        name: baseCharacter.name,
                        description: baseCharacter.description,
                        full_description: fullDescription.description,
                    });
                  }else if(!character.full_description) {
                    // Character exists but full_description is missing - retry it
                    const fullDescription = await fullCharacterDescriptionGenerateService(
                      baseCharacter.description,
                      style.name
                    );
                    
                    if(fullDescription.success) {
                      character.full_description = fullDescription.description;
                      await character.save();
                    } else {
                      console.error(`Description retry failed for ${baseCharacter.name}`);
                      continue;
                    }
                  }

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
        }

      if(story.status=="generating-characters"||story.status=="generating-scenes"){

        story.status = "generating-scenes";
        await story.save();

        const scenes = await Scene.findAll({ where: { story_id: storyId } }).catch(err => {
          console.error("Error fetching scenes:", err);
          return [];
        })
        for (let BaseScene of parsedPrompt.data.scenes) {
          try {
            const scene = scenes.find(scene => scene.scene_order == BaseScene.scene_number);
            if(scene && scene.status=="done") continue;
            const result = await generateSceneService(
              userId,
              storyId,
              BaseScene.prompt,
              BaseScene.scene_number,
              "auto",
              scene ? scene.id : null,
              true
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
      }

      //uuser corn job to update the status the its failed here 
      if(story.status=="generating-scenes"){
        try {
          story.status =
            story.generated_scenes === story.total_scenes
              ? "completed"
              : "partially-completed";
          await story.save();
        } catch (err) {
          console.error("Error saving final story status:", err);
        }
      }
    } catch (err) {
      console.error("Unexpected worker error:", err);
      throw Error(err.message||"internal error in auto story generation");
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
    console.log(`Job ${job.id} error: ${err?.message||"internal error in auto story generation"}`);
    
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