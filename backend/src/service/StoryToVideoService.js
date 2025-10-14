const { Scene } = require("../models");

exports.createStoryToVideoService = async (userId, storyId) => {
    try {
        const Scenes= await Scene.findAll({ where: { user_id: userId, story_id: storyId } });

        if(Scenes === null||Scenes.length === 0){
            return { status: 404, success: false, message: 'Story not found' };
        }
        
    } catch (e) {
        console.error(e);
        return { status: 500, success: false, message: 'Failed to create story to video' };
    }
};