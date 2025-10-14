const { createStoryToVideoService } = require("../service/StoryToVideoService");


exports.createStoryToVideoController = async (req, res) => {
    const { storyId} = req.params;
    const userId = req.user.id;

    const result = await createStoryToVideoService(userId, storyId);
    return res.status(result.status).json(result);
};