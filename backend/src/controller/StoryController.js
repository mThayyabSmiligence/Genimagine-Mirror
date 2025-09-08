const { createStory, getUserStories, getStoryById, updateStory, deleteStory } = require('../service/StoryService');

/**
 * POST /stories
 * Body: { title }
 */
exports.createStoryController = async (req, res) => {
  try {
    const { name, description, style_id } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Title is required' , status: 400 ,frontendMessage: 'Title is required'});
    if (!style_id) return res.status(400).json({ success: false, message: 'Style id is required' , status: 400 ,frontendMessage: 'Style needs to be selected'});

    const story = await createStory({ user_id: req.user.id, name, description, style_id });

    res.status(story.status).json(story);
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
    res.status(stories.status).json(stories);
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
    const story = await getStoryById(req.params.id, req.user.id);
    res.status(story.status).json(story);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to fetch story' });
  }
};

exports.updateStoryController = async (req, res) => {
  try {
    const { name, description } = req.body;
    const user_id = req.user.id;  
    const story = await updateStory(req.params.id, { name, description },user_id);
    res.status(story.status).json(story);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to update story' });
  }
};

exports.deleteStoryController = async (req, res) => {
  try {
    const story = await deleteStory(req.params.id, req.user.id);
    res.status(story.status).json(story);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to delete story' });
  }
};