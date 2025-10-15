const storyToVideoQueue = require("../queue/StoryToVideoQueue");
const { createStoryToVideoService } = require("../service/StoryToVideoService");
const asyncHandler = require("../utils/asyncHandler");

exports.createStoryToVideoController =asyncHandler( async (req, res) => {
    const {id} = req.params;
    const userId = req.user.id;

    // const result = await createStoryToVideoService(userId, id);
    const result = await storyToVideoQueue.add("storyToVideoQueue", { storyId: id, userId: userId });
    return res.status(200).json(result);
});