const { Scene } = require("../models");
const AppError = require("../utils/AppError");

exports.createStoryToVideoService = async (userId, storyId) => {
    
    const Scenes= await Scene.findAll({ where: { user_id: userId, story_id: storyId } });

    if(Scenes === null||Scenes.length === 0){
        throw new AppError('No scenes found for this story', 404)
    };
    
        
        
   
};


exports.nrrativizeTheDescription = async (scenes) => {
    // This will return an array of objects, each with a scene_order and description property:
    // Example: [{scene_order: 1, description: "Scene 1 description"}, {scene_order: 2, description: "Scene 2 description"}]
    const input = scenes.map((scene) => ({scene_order: scene.scene_order, description: scene.prompt}));
    
    
};