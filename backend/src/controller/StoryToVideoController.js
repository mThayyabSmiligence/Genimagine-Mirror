const storyToVideoQueue = require("../queue/StoryToVideoQueue");
const { createStoryToVideoService, getStoryToVideoByIdService, getStoryToVideoByStoryIdService } = require("../service/StoryToVideoService");
const asyncHandler = require("../utils/asyncHandler");

exports.createStoryToVideoController =asyncHandler( async (req, res) => {
    const {id} = req.params;
    const {language= "en"} = req.body
    const userId = req.user.id;

    const result = await createStoryToVideoService(userId, id, language);
    const queue = await storyToVideoQueue.add("storyToVideoQueue", { id:result.id,userId:userId });
    return res.status(200).json(result);
});

exports.getStoryToVideoByStoryIdController =asyncHandler( async (req, res) => {
    const {id} = req.params;
    const userId = req.user.id;
    const result = await getStoryToVideoByStoryIdService(id, userId);
    return res.status(200).json(result);
})