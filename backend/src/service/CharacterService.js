const generateStabilityAiImage = require('../API/StabilityAiImage');
const db = require('../config/connectDatabase');
const { userGenerateImageController } = require('../controller/UserGenerateImageController');
const { Character, Story, Style } = require('../models');
const { paidGenerateImageService } = require('./PaidGenerateImageService');
const { uploadImageToServer, deleteFromServer } = require('./UploadToServerService');
const axios = require('axios');
require('dotenv').config();


exports.getCharactersByStoryService = async (user_id, story_id) => {
  try {
    console.log(user_id, story_id);
    const characters = await Character.findAll({ where: { user_id, story_id, deleted_at: null } });
    const count = characters.length;
    return {
      status: 200,
      success: true,
      count,
      characters,
      message: 'Characters fetched successfully'
    };
  } catch (e) {
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.getCharactersByUserService = async (user_id) => {
  try {
    const characters = await Character.findAll({ where: { user_id, deleted_at: null } });
    const count = characters.length;
    return {
      status: 200,
      success: true,
      count,
      characters,
      message: 'Characters fetched successfully'
    };
  } catch (e) {
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.generateCharacterService = async (user_id, story_id, name, description = null) => {
  try {



    //get story details
    const story = await Story.findOne({ where: { id: story_id, user_id } });
    if (!story || story.user_id !== user_id) return { status: 404, success: false, message: 'Story not found' };

    //get style details
    const style_id = story.style_id;
    const style = await Style.findOne({ where: { id: style_id } });
    if (!style) return { status: 404, success: false, message: 'Style not found' };

    const full_description = await this.fullCharacterDescriptionGenerateService(description, style.name);

    if (!full_description.success) return { status: 500, success: false, message: 'Failed to generate character' };

    //create character
    const character = await Character.create({ user_id, story_id, name, description, full_description: full_description.description||null });


    //generate character image
    const prompt = `Character: ${name}. 
      Description: ${full_description.description||description}. 
      Art style: ${style.name}. 
      Generate a full-body portrait in ${style.name} style, clean background, high quality.`

   
    const character_image = await generateStabilityAiImage(prompt );

    if (!character_image) return { status: 500, success: false, message: 'Failed to generate character' };


    //save character image
    const upload = await uploadImageToServer(character_image, user_id, null, character.id, "character");
    character.image_url = upload.imageUrl;
    character.image_path = upload.imagePath;
    await character.save();

    return {
      status: 201,
      success: true,
      message: 'Character created successfully',
      character
    };
  } catch (e) {
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.regenerateCharacterService = async (user_id, character_id, name = null, description = null) => {
  try {
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

    if (!character || character.user_id !== user_id) return { status: 404, success: false, message: 'Character not found' };

    if(character.image_type=="uploaded") return { status: 404, success: false, message: 'This charater is uploaded by you, you can not regenerate it' };
    
    //deleting the old character image
    if(character.image_path){
      const deleteCharacterImage = await deleteFromServer(character.image_path, user_id, character.story_id, character.id);
      if (!deleteCharacterImage.success) return { status: 500, success: false, message: 'Failed to delete character image' };
    }

    //update character details
    if (name) character.name = name;
    if (description) character.description = description;
    character.image_url = null;
    character.image_path = null;
    await character.save();


    const full_description = await this.fullCharacterDescriptionGenerateService(character.description, character.story.style.name);

    if (!full_description.success) return { status: 500, success: false, message: 'Failed to generate character' };

    //generate character image
    const prompt = `Character: ${character.name}. 
      Description: ${full_description.description || character.description}. 
      Art style: ${character.story.style.name}. 
      Generate a full-body portrait in ${character.story.style.name} style, clean background, high quality.`



    const character_image = await generateStabilityAiImage( prompt );

    if (!character_image) return { status: 500, success: false, message: 'Failed to generate character' };

    //save character image
    const upload = await uploadImageToServer(character_image, user_id, null, character.id, "character");
    character.image_url = upload.imageUrl;
    character.image_path = upload.imagePath;
    await character.save();

    return {
      status: 200,
      success: true,
      message: 'Character regenerated successfully',
      character
    }
  } catch (e) {
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.uploadCharacterImageService = async (user_id, image, name, description, story_id) => {
  try{

    const story = await Story.findOne({ where: { id: story_id, user_id } });
    if (!story || story.user_id !== user_id) return { status: 404, success: false, message: 'Story not found' };

    const character = await Character.create({ user_id, story_id, name, description,image_type:"uploaded" });
    const upload = await uploadImageToServer(image,user_id,null,character.id,"character");
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
exports.reuploadCharacterImageService = async (user_id, image, name=null, description=null, story_id, character_id) => {
  try{
    const character = await Character.findOne({ where: { id: character_id, user_id } });
    if (!character || character.user_id !== user_id) return { status: 404, success: false, message: 'Character not found' };

    if(character.image_type=="generated") return { status: 404, success: false, message: 'This charater is generated by AI, you can not reupload it' };

    const deleteCharacterImage = await deleteFromServer(character.image_path, user_id, story_id, character.id);
    if (!deleteCharacterImage.success) return { status: 500, success: false, message: 'Failed to delete character image' };
    
    const upload = await uploadImageToServer(image,user_id,null,character.id,"character");
    character.image_url = upload.imageUrl;
    character.image_path = upload.imagePath;
    if (name) character.name = name;
    if (description) character.description = description;
    await character.save();
    return { 
      status: 200, 
      success: true,
      message: 'Character reuploaded successfully',
      character
    };
  }catch(e){
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}
exports.softDeleteCharacterService = async (user_id, character_id) => {
  try {
    const character = await Character.findOne({ where: { id: character_id, user_id } });
    if (!character || character.user_id !== user_id) return { status: 404, success: false, message: 'Character not found' };
    character.deleted_at = new Date();
    await character.save();

    return {
      status: 200,
      success: true,
      message: 'Character deleted successfully'
    };
  } catch (e) {
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.forceDeleteCharacterService = async (user_id, character_id) => {
  try {
    const character = await Character.findOne({ where: { id: character_id, user_id } });
    if (!character || character.user_id !== user_id) return { status: 404, success: false, message: 'Character not found' };
    await character.destroy();

    return {
      status: 200,
      success: true,
      message: 'Character deleted successfully'
    };
  } catch (e) {
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}

exports.restoreCharacterService = async (user_id, character_id) => {
  try {
    const character = await Character.findOne({ where: { id: character_id, user_id } });
    if (!character || character.user_id !== user_id) return { status: 404, success: false, message: 'Character not found' };
    character.deleted_at = null;
    await character.save();

    return {
      status: 200,
      success: true,
      message: 'Character restored successfully'
    };
  } catch (e) {
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }
}


exports.fullCharacterDescriptionGenerateService = async (description, style) => {
  try {
    const model_url = process.env.CLOUD_FLARE_LLAMA_3_8B_INSTRUCT;
    const api_key = process.env.CLOUD_FLARE_API_KEY;
    const account_id = process.env.CLOUD_FLARE_ACC_ID;
    const messages = [
      {
        "role": "system",
        "content": `You are a character prompt refiner for an AI image generation system.

Your task:
- Take the user's raw character description.
- Preserve ALL details explicitly mentioned by the user (do not change or ignore them).
- Fill in missing **identity details** with reasonable defaults so the character looks consistent across multiple images.
- Exclude scene-dependent details like pose, facial expression, mood, or background. Those will be handled separately in the scene generation step.

Attributes you should always include:
1. Age range
2. Gender
3. Ethnicity / Skin tone
4. Hair color, style, and length
5. Eye color
6. Body type / Build
7. Outfit details
8. Accessories (if any)

Format:
- Output only a single descriptive paragraph focused purely on the character's appearance.
- Do not include background, setting, or pose unless the user explicitly specified it as part of the character's core look.
- Do not use bullet points, JSON, or explanations.`
      },
      {
        "role": "user",
        "content": "User Descrition: " + description + ", style: " + style
      }
    ]
    // console.log("messages:",messages);
    const inputs = {
      messages: messages,
      "max_tokens": 400,
      "temperature": 0.7,
      "top_p": 0.9,
      "top_k": 40,
      "repetition_penalty": 1.1,
      "presence_penalty": 0,
      "frequency_penalty": 0,
      "stream": false
    };

    const api_url = "https://api.cloudflare.com/client/v4/accounts/"+account_id+"/ai/run/"+model_url

    const result = await axios.post(api_url, inputs, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      }
    });
    
    // console.log("result:",result.data.result.response);
    return {
      status: 200,
      success: true,
      message: 'Character description generated successfully',
      description: result.data.result.response
    }
  } catch (e) {
    console.error(e);
    return { status: 500, success: false, message: 'Failed to fetch characters' };
  }

}

exports.createCharacterImageGeneratePrompt=(character,style)=>{

  if(!character) return { status: 404, success: false, message: 'Character not found' };
  if(!character.name) return { status: 404, success: false, message: 'Character name not found' };
  if(!character.description) return { status: 404, success: false, message: 'Character description not found' };
  if(!style) return { status: 404, success: false, message: 'Character style not found' };

  //generate character image
  const prompt = `Character: ${character.name}. 
    Description: ${character.description}. 
    Art style: ${style}. 
    Generate a full-body portrait in ${style} style, clean background, high quality.`

  return prompt
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

// hey chat gpt i working on story creation flow, first let me tell you the flow 
// ui flow:
// 1. story creation - user goes to story page and clicks new story , a new pages opens where user can enter title , description and choose the style of image .
// 2. character creation - after creating story then user to sent to character creation page , where user can create the charaters with name and description or can upload the character but still needs to fill the name and description 
// 3. scene creation - after creating character then user sent to scene page , user can enter the what they want and which character are present and what they are doing in the scene. then the scene with thr character is created and action is created

// back ground process:
// 1. story creation - 