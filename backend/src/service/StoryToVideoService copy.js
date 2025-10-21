const { llama3BInstructText } = require("../API/CloudFlare.api");
const { extractValidJson } = require("../helper/JsonHelper");
const { Scene, StoryToVideo } = require("../models");
const AppError = require("../utils/AppError");
const path = require("path");
const gTTS = require('gtts');
const fs = require('fs');


const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const IMAGES_DIR = path.join(ROOT_DIR, 'assets/images');
const OUTPUT_DIR = path.join(ROOT_DIR, 'assets/output');

if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });



exports.createStoryToVideoService = async (userId, storyId) => {
    
    const Scenes= await Scene.findAll({ where: { user_id: userId, story_id: storyId } });

    if(Scenes === null||Scenes.length === 0){
        throw new AppError('No scenes found for this story', 404)
    };
    
    const narrations= await this.nrrativizeTheDescription(Scenes);
       
    try {
        const storyToVideo = await StoryToVideo.create(
            {
            story_id: storyId,
            narration:narrations,
            video_url: "a",
            video_path: "a"
            }
        );

        await this.generateAudioForNarrations(narrations);
        return storyToVideo
    } catch (error) {
        console.error("Error creating storyToVideo:", error);
        throw new AppError('Failed to create storyToVideo', 500)
    }  
   
};


exports.nrrativizeTheDescription = async (scenes) => {
    // This will return an array of objects, each with a scene_order and description property:
    // Example: [{scene_order: 1, description: "Scene 1 description"}, {scene_order: 2, description: "Scene 2 description"}]
    const input = scenes.map((scene) => ({scene_order: scene.scene_order, description: scene.prompt}));

    const systemPrompt ="You convert scene descriptions to short, engaging narratives for video narration in a json format with the following structure: [{scene_order: number, narration: string}]."
    const message=[
        {
            role: "system",
            content: systemPrompt
        },
        {
            role: "user",
            content: JSON.stringify(input)
        }
    ]

    const response = await llama3BInstructText(message,2000);
    const narations = extractValidJson(response)
    console.log("narations : ",narations)
    
    return narations
    
};
exports.generateAudioForNarrations = async (narrations) => {
  try {
    await Promise.all(
      narrations.map((narration) => {
        return new Promise((resolve, reject) => {
          const randomNumber = Math.floor(100000 + Math.random() * 900000);
          const audioPath = path.join(AUDIO_DIR, `audio_${randomNumber}.mp3`);
          const gtts = new gTTS(narration.narration, 'en');
          gtts.save(audioPath, (err) => {
            if (err) {
              console.error("Error saving audio:", err);
              reject(err);
            } else {
              console.log(`✅ Audio saved: ${audioPath}`);
              resolve(audioPath);
            }
          });
        });
      })
    );
  } catch (error) {
    console.error("Error generating audio:", error);
    throw new AppError('Failed to generate audio', 500);
  }
};  