const db = require('../config/connectDatabase');
const { userGenerateImageController } = require('../controller/UserGenerateImageController');
const { Character, Story, Style } = require('../models');
const { paidGenerateImageService } = require('./PaidGenerateImageService');


exports.getCharactersByStoryService = async (user_id, story_id) => {
  try{
    const characters = Character.findAll({ where: { user_id, story_id } });
    return { 
      status: 200, 
      success: true, 
      characters , 
      message: 'Characters fetched successfully' 
    };
  }catch(e){
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.generateCharacterService = async (user_id, story_id, name, description) => {
  try{
    console.log(1);
    const story = await Story.findOne({ where: { id: story_id, user_id } });
    if(!story) return { status: 404, success: false, message: 'Story not found' };
    console.log(2);

    const style_id = story.style_id;
    console.log(3);

    const style = await Style.findOne({ where: { id: style_id } });
    if(!style) return { status: 404, success: false, message: 'Style not found' };
    console.log(4);

    const prompt = `Character: ${name}. 
      Description: ${description}. 
      Art style: ${style.name}. 
      Generate a full-body portrait in ${style.name} style, clean background, high quality.`
    console.log(5);

    const inputs = {
      prompt: prompt,
      negative_prompt: "skull",
      width: 704,
      height: 1280,
      style: style.name
    };
    console.log(6);

    const model_url = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
    const character = await paidGenerateImageService(inputs, model_url);
    console.log(7);

    if(!character) return { status: 500, success: false, message: 'Failed to generate character' };
    console.log(8);

    return { 
      status: 201, 
      success: true,
      message: 'Character created successfully',
      character
    };
  }catch(e){
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}



// exports.createCharacterService = async (user_id, name, reference_image_url, description) => {
//   try {
//     const query = "INSERT INTO characters (user_id, name, reference_image_url, description) VALUES (?, ?, ?, ?)";
//     const [result] = await db.execute(query, [user_id, name, reference_image_url, description]);
//     return { status: 201, success: true, message: "Character created", character_id: result.insertId };
//   } catch (err) {
//     console.error("Error in createCharacterService", err);
//     return { status: 500, success: false, message: "Error creating character" };
//   }
// };

// exports.addExpressionService = async (character_id, emotion, reference_image_url) => {
//   try {
//     const query = "INSERT INTO expressions (character_id, emotion, reference_image_url) VALUES (?, ?, ?)";
//     await db.execute(query, [character_id, emotion, reference_image_url]);
//     return { status: 201, success: true, message: "Expression added" };
//   } catch (err) {
//     console.error("Error in addExpressionService", err);
//     return { status: 500, success: false, message: "Error adding expression" };
//   }
// };

// exports.addPoseService = async (character_id, pose_name, reference_image_url) => {
//   try {
//     const query = "INSERT INTO poses (character_id, pose_name, reference_image_url) VALUES (?, ?, ?)";
//     await db.execute(query, [character_id, pose_name, reference_image_url]);
//     return { status: 201, success: true, message: "Pose added" };
//   } catch (err) {
//     console.error("Error in addPoseService", err);
//     return { status: 500, success: false, message: "Error adding pose" };
//   }
// };

// exports.getCharactersService = async (user_id) => {
//   try {
//     const query = "SELECT * FROM characters WHERE user_id=?";
//     const [rows] = await db.execute(query, [user_id]);
//     return { status: 200, success: true, data: rows };
//   } catch (err) {
//     console.error("Error in getCharactersService", err);
//     return { status: 500, success: false, message: "Error fetching characters" };
//   }
// };

exports.createCharacter = async ({ user_id, name, description, reference_image_url }) => {
  const q = `INSERT INTO characters (user_id, name, description, reference_image_url) VALUES (?, ?, ?, ?)`;
  const [result] = await db.execute(q, [user_id, name, description, reference_image_url]);
  return { id: result.insertId, user_id, name, description, reference_image_url };
};

exports.getUserCharacters = async (user_id) => {
  const [rows] = await db.execute('SELECT * FROM characters WHERE user_id = ?', [user_id]);
  return rows;
};

exports.getCharacterById = async (id, user_id) => {
  const [rows] = await db.execute('SELECT * FROM characters WHERE id = ? AND user_id = ?', [id, user_id]);
  return rows.length ? rows[0] : null;
};
