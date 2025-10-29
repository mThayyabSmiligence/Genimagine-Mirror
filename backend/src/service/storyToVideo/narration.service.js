const path = require("path");
const fs = require('fs');

const { llama3BInstructText } = require("../../API/CloudFlare.api");
const { extractValidJson } = require("../../helper/JsonHelper");
const { getLanguageLabel } = require("../../helper/language.helper");
const StoryToVideoError = require("../../utils/StoryToVideoError");


const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const TEMP_IMAGES_DIR = path.join(ROOT_DIR, 'assets/temp/images');
const OUTPUT_DIR = path.normalize(path.join(ROOT_DIR, 'assets/output'));


if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_IMAGES_DIR)) fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

//input:
//scenes: [{scene_order: 1, description: "Scene 1 description"}, {scene_order: 2, description: "Scene 2 description"}]
//storyToVideoId: int
//language: string('en','es'...)
//previourNarrations: previourNarrations
//isNew: boolean

//output:
//scenesWithNarrations: [{id,scene_order: 1, narration: "Scene 1 narration", image_url: "Scene 1 image url"}]
//narrations: [{scene_order: 1, narration: "Scene 1 narration"}, {scene_order: 2, narration: "Scene 2 narration"}]
//success: boolean 

const nrrativizeTheDescription = async (scenes,storyToVideoId,language,previourNarrations=[],isNew=false) => {

    console.log("narrations is starting");
    // This will return an array of objects, each with a scene_order and description property:
    // Example: [{scene_order: 1, description: "Scene 1 description"}, {scene_order: 2, description: "Scene 2 description"}]
    const input = scenes.map((scene) => ({scene_order: scene.scene_order, description: scene.prompt}));

    const targetLanguage = getLanguageLabel(language) || 'English';

    const systemPrompt =`You convert scene descriptions to short, engaging narratives for video narration in a json format with the following structure: [{scene_order: number, narration: string}]. The narration text must be written in ${targetLanguage}. and keep the lables in english and always give object inside the array like in this structure [{scene_order: number, narration: string}].`
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
    let narrations = extractValidJson(response)
    if(typeof narrations === 'object' && !Array.isArray(narrations)){
        narrations = [narrations];
    }
    console.log("narations : ",narrations)

    if(!narrations || narrations.length === 0){
        throw new StoryToVideoError('Failed to generate narrations', 500,storyToVideoId)
    }
    let scenesWithNarrations=[];
    try{
        if(isNew){
            scenesWithNarrations = scenes.map((scene, index) => {
                const narration = narrations.find(n => n.scene_order === scene.scene_order);
                if (narration) {
                return {
                    id: scene.id,
                    image_url: scene.image_url,
                    scene_order: scene.scene_order,
                    narration: narration.narration,
                }
                } else {
                return {
                    narrations:pushToPreviourNarrations(previourNarrations,null,language,"failed"),
                    success:false
                }
                }
            }).filter(s => s !== null);
        }
    } catch (error) {

        console.error("Error creating storyToVideo:", error);
        return { 
            narrations: pushToPreviourNarrations(previourNarrations,null,language,"failed"),
            success:false
        }
        
    }

    previourNarrations = pushToPreviourNarrations(previourNarrations,narrations,language,"done")

    console.log("scenesWithNarrations : ",scenesWithNarrations)
    return {

        narrations:previourNarrations,
        scenesWithNarrations,
        success:true
    }
    
};


const pushToPreviourNarrations = (previousNarrations,narration,language,status) => {
    if(previousNarrations.length >0){
        previousNarrations = previousNarrations.map((narration) => {
            if(narration.language === language){
                return {
                    language:narration.language,
                    narrations:narration.narrations,
                    status:status
                }
            }else{
                return narration;
            }
            
        });
    }else{
        previousNarrations = [
            {
                language:language,
                narrations:narration,
                status:status
            }
        ]
    }
    return previousNarrations
}
module.exports = {nrrativizeTheDescription};