const { createStoryToVideoService } = require("../service/StoryToVideoService");
const asyncHandler = require("../utils/asyncHandler");

exports.createStoryToVideoController =asyncHandler( async (req, res) => {
    const { storyId} = req.params;
    const userId = req.user.id;

    const result = await createStoryToVideoService(userId, storyId);
    return res.status(result.status).json(result);
});