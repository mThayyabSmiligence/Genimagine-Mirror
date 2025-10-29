const addLanguageStoryToVideoQueue = require("../queue/AddLanguageStoryToVideoQueue");
const storyToVideoQueue = require("../queue/StoryToVideoQueue");
const { createStoryToVideoService, getStoryToVideoByIdService, getStoryToVideoByStoryIdService, deleteStoryToVideoByStoryIdService, addLanguageStoryToVideoCheck} = require("../service/storyToVideo/StoryToVideoService");
const asyncHandler = require("../utils/asyncHandler");

exports.createStoryToVideoController =asyncHandler( async (req, res) => {
    const {id} = req.params;
    const userId = req.user.id;

    const result = await createStoryToVideoService(userId, id);
    const queue = await storyToVideoQueue.add("storyToVideoQueue", { id:result.id,userId:userId });
    return res.status(200).json(result);
});

exports.getStoryToVideoByStoryIdController =asyncHandler( async (req, res) => {
    const {id} = req.params;
    const userId = req.user.id;
    const result = await getStoryToVideoByStoryIdService(id, userId);
    return res.status(200).json(result);
})

exports.addLanguageStoryToVideoController =asyncHandler( async (req, res) => {
    const {id} = req.params;
    const {language} = req.body;
    const userId = req.user.id;
    const result = await addLanguageStoryToVideoCheck(id,language);
    if(!result){
        return res.status(409).json({success:false, message:"error adding language"});
    }

    const queue = await addLanguageStoryToVideoQueue.add("AddLanguageStoryToVideoQueue", { id:id,userId:userId,language:language });

    return res.status(200).json({
        success: true,
        message: "Language  will be added shortly"
    });
})

// exports.generateNewAudioTrackController = asyncHandler(async (req, res) => {
//     const { language } = req.body;
//     const result = await addLanguageAudioTrackService(
//         req.params.id, 
//         language, 
//         req.user.id
//     );
//     res.status(200).json(result);
// })

exports.deleteStoryToVideoByStoryIdController =asyncHandler( async (req, res) => {
    const {id} = req.params;
    const userId = req.user.id;
    const result = await deleteStoryToVideoByStoryIdService(id, userId);
    return res.status(200).json({
        success: true,
        message: "Story to video deleted successfully"
    });
})