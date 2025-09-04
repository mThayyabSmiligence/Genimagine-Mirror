const { createStory, getUserStories, getStoryById } = require('../service/StoryService');

/**
 * POST /stories
 * Body: { title }
 */
exports.createStoryController = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const story = await createStory({ user_id: req.user.id, title });
    res.status(201).json({ success: true, story });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to create story' });
  }
};

/**
 * GET /stories
 */
exports.getUserStoriesController = async (req, res) => {
  try {
    const stories = await getUserStories(req.user.id);
    res.status(200).json({ success: true, stories });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to fetch stories' });
  }
};

/**
 * GET /stories/:id
 */
exports.getStoryByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await getStoryById(id, req.user.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    res.status(200).json({ success: true, story });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to fetch story' });
  }
};
