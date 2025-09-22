const db = require('../config/connectDatabase');
const { Sequelize } = require('sequelize');
const Story = require('../models/Story');
const Character = require('../models/Character');
const { Scene } = require('../models');


/**
 * Create a new story
 */
exports.createStory = async ({ user_id, name, description, style_id}) => {
  try{
    const story =await Story.create({ user_id, name , description, style_id});
    return{
      success: true,
      story,
      message: 'Story created successfully',
      status: 201
    }
  }catch(e){
    console.error(e);
    return{
      success: false,
      message: 'Failed to create story',
      status: 500
    }
  }
};

/**
 * Get all stories of a user
 */
exports.getUserStories = async (user_id) => {
  try {
    const stories = await Story.findAll({
  where: { user_id },
  attributes: {
    include: [
      [Sequelize.fn("COUNT", Sequelize.fn("DISTINCT", Sequelize.col("characters.id"))), "characterCount"],
      [Sequelize.fn("COUNT", Sequelize.fn("DISTINCT", Sequelize.col("scenes.id"))), "sceneCount"],
      [Sequelize.fn("MIN", Sequelize.col("scenes.image_url")), "thumbnail"]
    ],
  },
  include: [
    {
      model: Character,
      as: "characters",
      attributes: [],
      required: false,
      where: { deleted_at: null },
    },
    {
      model: Scene,
      as: "scenes",
      attributes: [],
      required: false,
      where: { deleted_at: null },
    },
  ],
  group: ["Story.id"],
});




    return {
      success: true,
      stories,
      message: "Stories fetched successfully",
      status: 200,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to fetch stories",
      status: 500,
    };
  }
};
/**
 * Get a single story by ID for a user
 */
exports.getStoryById = async (story_id, user_id) => {
  try{
    const story = await Story.findOne({ where: { id: story_id, user_id } });
    if(!story){
      return{
        success: false,
        message: 'Story not found',
        status: 404
      }
    }
    return{
      success: true,
      story,
      message: 'Story fetched successfully',
      status: 200
    }
  }catch(e){
    console.error(e);
    return{
      success: false,
      message: 'Failed to fetch story',
      status: 500
    }
  }
};


exports.updateStory = async (id, data,userId) => {
  try{
    const storyCheck = await this.getStoryById(id,userId);
    if (!storyCheck.success) return{
      success: false,
      message: 'Story not found',
      status: 404
    };
    const story = await Story.update(data, { where: { id } });
    return{
      success: true,
      story,
      message: 'Story updated successfully',
      status: 200
    }
  }catch(e){
    console.error(e);
    return{
      success: false,
      message: 'Failed to update story',
      status: 500
    }
  }
};

exports.deleteStory = async (id, userId) => {
  try{
    const storyCheck = await this.getStoryById(id,userId);
    if (!storyCheck.success) return{
      success: false,
      message: 'Story not found',
      status: 404
    };
    const story = await Story.destroy({ where: { id } });
    return{
      success: true,
      story,
      message: 'Story deleted successfully',
      status: 200
    }
  }catch(e){
    console.error(e);
    return{
      success: false,
      message: 'Failed to delete story',
      status: 500
    }
  }
};

exports.getAllStories = async () => {
  try{
    const stories = await Story.findAll();
    return{
      success: true,
      stories,
      message: 'Stories fetched successfully',
      status: 200
    }
  }catch(e){
    console.error(e);
    return{
      success: false,
      message: 'Failed to fetch stories',
      status: 500
    }
  }
};

