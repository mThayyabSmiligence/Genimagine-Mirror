const db = require('../config/connectDatabase');
const { userGenerateImageController } = require('../controller/UserGenerateImageController');
const { Character, Story, Style } = require('../models');
const { paidGenerateImageService } = require('./PaidGenerateImageService');
const { uploadImageToServer, deleteFromServer } = require('./UploadToServerService');


exports.getCharactersByStoryService = async (user_id, story_id) => {
  try{
    console.log(user_id, story_id);
    const characters = await Character.findAll({ where: { user_id, story_id , deleted_at: null} });
    const count = characters.length;
    return { 
      status: 200, 
      success: true, 
      count,
      characters, 
      message: 'Characters fetched successfully' 
    };
  }catch(e){
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.getCharactersByUserService = async (user_id) => {
  try{
    const characters = await Character.findAll({ where: { user_id , deleted_at: null} });
    const count = characters.length;
    return { 
      status: 200, 
      success: true, 
      count,
      characters , 
      message: 'Characters fetched successfully' 
    };
  }catch(e){
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.generateCharacterService = async (user_id, story_id, name, description=null) => {
  try{

    //get story details
    const story = await Story.findOne({ where: { id: story_id, user_id } });
    if(!story || story.user_id !== user_id) return { status: 404, success: false, message: 'Story not found' };

    //get style details
    const style_id = story.style_id;
    const style = await Style.findOne({ where: { id: style_id } });
    if(!style ) return { status: 404, success: false, message: 'Style not found' };


    //create character
    const character = await Character.create({ user_id, story_id, name, description, user_id});


    //generate character image
    const prompt = `Character: ${name}. 
      Description: ${description}. 
      Art style: ${style.name}. 
      Generate a full-body portrait in ${style.name} style, clean background, high quality.`

    const inputs = {
      prompt: prompt,
      negative_prompt: "skull",
      width: 704,
      height: 704,
      style: style.name
    };

    const model_url = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
    const character_image = await paidGenerateImageService(inputs, model_url);

    if(!character_image) return { status: 500, success: false, message: 'Failed to generate character' };


    //save character image
    const upload = await uploadImageToServer(character_image,user_id,null,character.id,"character");
    character.image_url = upload.imageUrl;
    character.image_path = upload.imagePath;
    await character.save();

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

exports.regenerateCharacterService = async (user_id, character_id, name=null, description=null) => {
  try{
    const character = await Character.findOne({
      where: { id: character_id, user_id },
      include: [
        {
          model: Story,
          as: "story",   // must match association alias
          include: [
            {
              model: Style,
              as: "style" // must match association alias
            }
          ]
        }
      ]
    });

    if(!character || character.user_id !== user_id) return { status: 404, success: false, message: 'Character not found' };
    
    //deleting the old character image
    const deleteCharacterImage = await deleteFromServer(character.image_path,user_id,character.story_id,character.id);
    if(!deleteCharacterImage.success) return { status: 500, success: false, message: 'Failed to delete character image' };

    //update character details
    if(name) character.name = name;
    if(description) character.description = description;
    character.image_url = null;
    character.image_path = null;
    await character.save();

    //generate character image
    const prompt = `Character: ${character.name}. 
      Description: ${character.description}. 
      Art style: ${character.story.style.name}. 
      Generate a full-body portrait in ${character.story.style.name} style, clean background, high quality.`
      
    console.log(prompt);

    const inputs = {
      prompt: prompt,
      negative_prompt: "skull",
      width: 704,
      height: 704,
      style: character.story.style.name
    };

    const model_url = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
    const character_image = await paidGenerateImageService(inputs, model_url);

    if(!character_image) return { status: 500, success: false, message: 'Failed to generate character' };

    //save character image
    const upload = await uploadImageToServer(character_image,user_id,null,character.id,"character");
    character.image_url = upload.imageUrl;
    character.image_path = upload.imagePath;
    await character.save();

    return{
      status: 200,
      success: true,
      message: 'Character regenerated successfully',
      character
    }
  }catch(e){
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.softDeleteCharacterService = async (user_id, character_id) => {
  try{
    const character = await Character.findOne({ where: { id: character_id, user_id } });
    if(!character || character.user_id !== user_id) return { status: 404, success: false, message: 'Character not found' };
    character.deleted_at = new Date();
    await character.save();
    
    return { 
      status: 200, 
      success: true,
      message: 'Character deleted successfully'
    };
  }catch(e){
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.forceDeleteCharacterService = async (user_id, character_id) => {
  try{
    const character = await Character.findOne({ where: { id: character_id, user_id } });
    if(!character || character.user_id !== user_id) return { status: 404, success: false, message: 'Character not found' };
    await character.destroy();
    
    return { 
      status: 200, 
      success: true,
      message: 'Character deleted successfully'
    };
  }catch(e){
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.restoreCharacterService = async (user_id, character_id) => {
  try{
    const character = await Character.findOne({ where: { id: character_id, user_id } });
    if(!character || character.user_id !== user_id) return { status: 404, success: false, message: 'Character not found' };
    character.deleted_at = null;
    await character.save();
    
    return { 
      status: 200, 
      success: true,
      message: 'Character restored successfully'
    };
  }catch(e){
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

// exports.saveCharacterService = async (user_id, character_image, story_id, name, description) => {
//   try{
//     console.log(4);
//     if(!character_image) return { status: 404, success: false, message: 'Character not found' };
//     const character = await Character.create({ user_id, story_id, name, description  });
//     console.log(5);
//     const upload = await uploadImageToServer(character_image,user_id,null,character.id,"character");
//     console.log(6);

//     console.log(upload);
//     character.image_url = upload.imageUrl;
//     character.image_path = upload.imagePath;

//     console.log(7);

//     await character.save();
//     console.log(8);

//     return { 
//       status: 201, 
//       success: true,
//       message: 'Character created successfully',
//       character
//     };
//   }catch(e){
//     console.error(e);
//     return { status: 500, success: false, message: 'Failed to fetch characters' };
//   }
// }



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
