const autoStoryQueue = require("../queue/AutoStoryQueue");
const numberQueue = require("../queue/TestQueue");
const { createAutoStoryService, extractScenesAndCharactersService, printNumbers, getStatusService, getStoryStatusService } = require("../service/AutoStoryService");

exports.createAutoStoryController = async (req, res) => {
    const {name,description, total_scenes, style_id}= req.body;
    const user_id = req.user.id;
    
    if(!description || !total_scenes || !style_id) return res.status(400).json({ success: false, message: 'All fields are required' });

    // const response = await extractScenesAndCharactersService(prompt, no_of_scene);
    
    const result = await createAutoStoryService(user_id, name, description, total_scenes, style_id);

    if(result.success){
        const job = await autoStoryQueue.add("generateStory",{storyId: result.story.id,userId:user_id});
    }
    
    return res.status(200).json(result);
}

exports.getStoryStatus = async (req, res) => {
    const {id} = req.params;
    const user_id = req.user.id;
    const result = await getStoryStatusService(id, user_id);
    return res.status(result.status).json(result);
}