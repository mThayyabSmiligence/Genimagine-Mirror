// services/sceneService.js
const db = require('../config/connectDatabase');
const { paidGenerateImageService } = require("../service/PaidGenerateImageService");
const axios = require('axios');
require('dotenv').config();
const stringSimilarity = require("string-similarity");
const FormData = require("form-data");
const sharp = require("sharp");

exports.generateSceneService = async (user_id, story_id, prompt) => {
  try {

    console.log("user_id:",user_id); 
    //get story details
    const story = await Story.findOne({ where: { id: story_id, user_id } });
    // Check if the story exists
    if (!story || story.user_id !== user_id) return { status: 404, success: false, message: 'Story not found' };

    //get style details
    const style_id = story.style_id;
    const style = await Style.findOne({ where: { id: style_id } });
    // Check if the style exists
    if (!style) return { status: 404, success: false, message: 'Style not found' };

    const referenced_characters = await this.getReferencedCharacters(prompt,story_id);
    if (!referenced_characters.success) return { status: 500, success: false, message: 'Failed to generate scene' };
    const characters = referenced_characters.data;

    //get latest scene of story
    const latestScene = await Scene.findOne({
      where: { story_id },
      order: [['scene_order', 'DESC']],
    });

    const scene_order = latestScene ? latestScene.scene_order + 1 : 1;

    //create scene
    const scene = await Scene.create({ user_id, story_id, prompt, characters:characters.characters,full_structured_prompt:characters,location:characters.location,environment:characters.environment, scene_order });

    //generate scene image
    // Build natural language prompt
    const scenePrompt = `
    Scene at ${characters.location}, with environment: ${characters.environment}.
    ${characters.characters.map(c => `${c.name} is ${c.action}. ${c.full_description || c.description || ''}`).join(" ")}
    `;

    console.log("scenePrompt:",scenePrompt);
    const imageData = await this.generateSceneImage(
      story_id,
      scene.id,
      latestScene,
      scene_order,
      scenePrompt, // ✅ plain descriptive text
      user_id
    );
      
    scene.image_url = imageData.image_url;
    scene.image_path = imageData.image_path;
    await scene.save();

    return { status: 200, success: true, scene};
  } catch (error) {
    console.error("Error generating scene:", error);
    return { status: 500, success: false, message: "Image generation failed" };
  }
};

exports.getReferencedCharacters = async (user_prompt,story_id) => {
  try {
    const cloud_flare_acc_id= process.env.CLOUD_FLARE_ACC_ID;
    const cloud_flare_api_key= process.env.CLOUD_FLARE_API_KEY;
    const model_id= process.env.CLOUD_FLARE_LLAMA_3_8B_INSTRUCT;

    const systemPrompt = `
            You are a scene parser that always returns valid JSON.
            Extract characters, their actions, and emotion if any or just leave it null and the scene setting from the text.

            Use this schema:
            {
              "characters": [{"name": "string", "action": "string","emotion": "string"}],
              "location": "string",   // where the scene takes place
              "environment": "string" // extra context (weather, chaos, mood, special events)
            }

            Rules:
            - "location" must be the physical place (rooftop, forest, castle hall).
            - "environment" must include surrounding details (blurred, people falling, magical glow, night sky).
            - Always return valid JSON ONLY.
            `;

    const result = await axios.post(`https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/${model_id}`, 
      {prompt: `${systemPrompt}\n\nUser: ${user_prompt}`}, 
      {
        headers: {
          'Authorization': `Bearer ${cloud_flare_api_key}`,
          'Content-Type': 'application/json',
        },
        responseType: 'json',
      }
    );
    const response = result.data.result.response;
    const data = safeJsonParse(response);

    const dbCharacters = await Character.findAll({ where: { story_id } });
    const mappedCharacters = mapCharacters(data.characters, dbCharacters);
    data.characters = mappedCharacters;


    return { status: 200, success: true, data };
  } catch (error) {
    console.error("Error fetching referenced characters:", error);
    return { status: 500, success: false, message: "Failed to fetch referenced characters" };
  }
};

exports.generateSceneImage = async (story_id, scene_id, latest_scene = null, scene_order, prompt, user_id) => {
  try {
    const api_mode = scene_order === 1 ? "text-to-image" : "image-to-image";
    const api_url = `https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/${api_mode}`;
    const api_key = process.env.STABILITY_API_KEY;

    let response;

    if (scene_order === 1) {
      // ✅ text-to-image supports JSON
      const input = {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        clip_guidance_preset: "FAST_BLUE",
        steps: 30,
        samples: 1,
        width: 1024,
        height: 1024
      };

      response = await axios.post(api_url, input, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${api_key}`,
        },
      });
    } else {
      // ✅ image-to-image must use multipart/form-data, no width/height allowed
      const image_url = latest_scene.image_url;

      // fetch init image as buffer
      const imgResp = await axios.get(image_url, { responseType: "arraybuffer" });
      let imageBuffer = Buffer.from(imgResp.data);

      // compress if larger than 5 MB
      if (imageBuffer.length > 5 * 1024 * 1024) {
        console.log("⚠️ Image too big, compressing...");
        imageBuffer = await sharp(imageBuffer)
          .jpeg({ quality: 80 })   // adjust quality if needed
          .resize(1024, 1024, { fit: "inside" }) // keep within max dims
          .toBuffer();
      }
      const formData = new FormData();
      formData.append("init_image", imageBuffer, { filename: "init.png" });
      formData.append("text_prompts[0][text]", prompt);
      formData.append("cfg_scale", 7);
      formData.append("clip_guidance_preset", "FAST_BLUE");
      formData.append("steps", 30);
      formData.append("samples", 1);

      response = await axios.post(api_url, formData, {
        headers: {
          ...formData.getHeaders(),
          Accept: "application/json",
          Authorization: `Bearer ${api_key}`,
        },
        maxBodyLength: Infinity,
      });
    }

    const imageBase64 = response.data.artifacts[0].base64;
    const imageBuffer = Buffer.from(imageBase64, "base64");

    const imageUploadResponse = await uploadImageToServer(
      imageBuffer,
      user_id,
      story_id,
      scene_id,
      "story"
    );

    return {
      status: 200,
      success: true,
      image_url: imageUploadResponse.imageUrl,
      image_path: imageUploadResponse.imagePath,
    };
  } catch (error) {
    console.error("Error generating scene image:", error.response?.data || error.message);
    return { status: 500, success: false, message: "Image generation failed" };
  }
};

function safeJsonParse(output) {
  try {
    // Extract only the JSON part using regex
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ No JSON object found in output:", output);
      return null;
    }

    let data = JSON.parse(jsonMatch[0]);

    // If nested JSON string (escaped), parse again
    if (typeof data === "string") {
      data = JSON.parse(data);
    }

    return data;
  } catch (err) {
    console.error("❌ Failed to parse JSON:", output);
    return null;
  }
}


function normalizeName(name) {
  return name.trim().toLowerCase();
}

function mapCharacters(parsedCharacters, dbCharacters) {
  // Preprocess DB characters once
  const dbNormalized = dbCharacters.map(c => ({
    ...c.dataValues,
    normalizedName: normalizeName(c.dataValues.name),
  }));

  return parsedCharacters.map(parsedChar => {
    const parsedNameNorm = normalizeName(parsedChar.name);
    const names = dbNormalized.map(c => c.normalizedName);

    // Fuzzy match
    const bestMatch = stringSimilarity.findBestMatch(parsedNameNorm, names);

    // If similarity is too low, treat as new character
    if (bestMatch.bestMatch.rating < 0.6) {
      return {
        ...parsedChar,
        exists: false,
        matchedId: null,
        matchedName: null,
        description: null,
        full_description: null
      };
    }

    // Get the actual DB character
    const matchedChar = dbNormalized.find(c => c.normalizedName === bestMatch.bestMatch.target);


    return {
      ...parsedChar,
      exists: true,
      matchedId: matchedChar.id,
      matchedName: matchedChar.name, // original case from DB
      description: matchedChar.description,
      full_description: matchedChar.full_description
    };
  });
}



exports.getScenesByStoryService= async (user_id, story_id) => {
  try {
    const scenes = await Scene.findAll({ where: { user_id, story_id }, order: [["scene_order", "ASC"]] });
    return { status: 200, success: true, scenes ,message: "Scenes fetched successfully" };
  } catch (error) {
    console.error("Error getting scenes:", error);
    return { status: 500, success: false, message: "Failed to get scenes" };
  }
};

exports.deleteSceneByIdService = async (user_id, scene_id) => {
  try {
    const result = await Scene.findOne({ where: { user_id, id: scene_id } });
    if (!result || result.length === 0) return { status: 404, success: false, message: "Scene not found" };
    const deltedScene = await deleteFromServer(result.image_path, user_id, result.story_id, result.id);
    await Scene.destroy({ where: { user_id, id: scene_id } });
    return { status: 200, success: true, message: "Scene deleted successfully" };
  } catch (error) {
    console.error("Error deleting scene:", error);
    return { status: 500, success: false, message: "Failed to delete scene" };
  }
};

// exports.generateSceneService = async (user_id, characters, prompt) => {
//   try {

//     let initImages = [];

//     for (let ch of characters) {
//       const [charRows] = await db.execute(
//         "SELECT reference_image_url FROM characters WHERE character_id=?",
//         [ch.character_id]
//       );
//       if (charRows.length === 0) continue;

//       let initImageUrl = charRows[0].reference_image_url;

//       if (ch.pose_id) {
//         const [poseRows] = await db.execute(
//           "SELECT reference_image_url FROM poses WHERE pose_id=?",
//           [ch.pose_id]
//         );
//         if (poseRows.length > 0 && poseRows[0].reference_image_url) {
//           initImageUrl = poseRows[0].reference_image_url;
//         }
//       }

//       if (ch.expression_id) {
//         const [expRows] = await db.execute(
//           "SELECT reference_image_url FROM expressions WHERE expression_id=?",
//           [ch.expression_id]
//         );
//         if (expRows.length > 0 && expRows[0].reference_image_url) {
//           initImageUrl = expRows[0].reference_image_url;
//         }
//       }

//       initImages.push(initImageUrl);
//     }

//     // 2. Build input for Cloudflare AI
//     // For now: just use the first image as init (basic implementation).
//     // Later: can merge multiple initImages into a composite base image.
//     const inputs = {
//       prompt,
//       image: initImages[0], // TODO: extend to multi-character layering
//       strength: 0.7,
//       guidance: 7.5,
//     };

//     const buffer = await paidGenerateImageService(
//       inputs,
//       "@cf/runwayml/stable-diffusion-v1-5-img2img"
//     );

//     if (!buffer) {
//       return { status: 500, success: false, message: "Image generation failed" };
//     }

//     // TODO: Save buffer to storage (S3, local, etc.)
//     const generatedImageUrl = "your-storage-url/" + Date.now() + ".png";

//     // 3. Insert into scenes
//     const [sceneResult] = await db.execute(
//       "INSERT INTO scenes (user_id, prompt, generated_image_url) VALUES (?, ?, ?)",
//       [user_id, prompt, generatedImageUrl]
//     );

//     const scene_id = sceneResult.insertId;

//     // 4. Insert characters into scene_characters
//     for (let ch of characters) {
//       await db.execute(
//         "INSERT INTO scene_characters (scene_id, character_id, pose_id, expression_id) VALUES (?, ?, ?, ?)",
//         [scene_id, ch.character_id, ch.pose_id || null, ch.expression_id || null]
//       );
//     }

//     return {
//       status: 201,
//       success: true,
//       message: "Scene generated",
//       scene_id,
//       generated_image_url: generatedImageUrl,
//     };
//   } catch (err) {
//     console.error("Error in generateSceneService", err);
//     return { status: 500, success: false, message: "Error generating scene" };
//   }
// };

// exports.getScenesService = async (user_id) => {
//   try {
//     const [scenes] = await db.execute(
//       "SELECT scene_id, prompt, generated_image_url, created_at FROM scenes WHERE user_id=? ORDER BY created_at DESC",
//       [user_id]
//     );

//     for (let scene of scenes) {
//       const [chars] = await db.execute(
//         `SELECT sc.character_id, c.name AS character_name, 
//                 sc.pose_id, p.pose_name, 
//                 sc.expression_id, e.emotion
//          FROM scene_characters sc
//          JOIN characters c ON sc.character_id = c.character_id
//          LEFT JOIN poses p ON sc.pose_id = p.pose_id
//          LEFT JOIN expressions e ON sc.expression_id = e.expression_id
//          WHERE sc.scene_id=?`,
//         [scene.scene_id]
//       );
//       scene.characters = chars;
//     }

//     return { status: 200, success: true, data: scenes };
//   } catch (err) {
//     console.error("Error in getScenesService", err);
//     return { status: 500, success: false, message: "Error fetching scenes" };
//   }
// };


const path = require('path');
const fs = require('fs');
const { buildScenePrompt } = require('./promptBuilder');
const { composeLayers } = require('../service/compositorService');
const { getCharacterById } = require('../service/CharacterService');
const { imageToImageService } = require('./ImageToImageService');
const { Story, Style, Character, Scene } = require('../models');
const { Json } = require('sequelize/lib/utils');
const { uploadImageToServer, deleteFromServer } = require('./UploadToServerService');

const ensureDir = async (dir) => fs.promises.mkdir(dir, { recursive: true });

exports.createSceneRow = async ({ story_id, user_id, meta = {} }) => {
  const q = `INSERT INTO scenes (story_id, user_id, meta) VALUES (?,?,?)`;
  const [result] = await db.execute(q, [story_id, user_id, JSON.stringify(meta)]);
  return result.insertId;
};

exports.attachSceneCharacterRow = async ({ scene_id, character_id, emotion, pose, layer_index = 0, generated_image_url = null }) => {
  const q = `INSERT INTO scene_characters (scene_id, character_id, emotion, pose, layer_index, generated_image_url) VALUES (?,?,?,?,?,?)`;
  const [result] = await db.execute(q, [scene_id, character_id, emotion, pose, layer_index, generated_image_url]);
  return result.insertId;
};

exports.updateSceneCharacterImage = async (id, url) => {
  const q = `UPDATE scene_characters SET generated_image_url = ? WHERE id = ?`;
  await db.execute(q, [url, id]);
};

exports.updateSceneComposite = async (scene_id, url) => {
  const q = `UPDATE scenes SET composite_image_url = ? WHERE id = ?`;
  await db.execute(q, [url, scene_id]);
};

/**
 * Generate a character layer via Cloudflare img2img using that character's reference image.
 * Returns { buffer, filePath, publicUrl }
 */
exports.generateCharacterLayer = async ({
  userId, character, emotion, pose,  width, height, model_url
}) => {
  const prompt = buildScenePrompt({
    character,
    emotion,
    pose,
    // backgroundPrompt: null, 
    extra: "full body, isolated subject, plain background, studio lighting, centered"
  });
  console.log("promp :",prompt)

  const buffer = await imageToImageService(
    { prompt, width, height, strength: 0.4, guidance: 8.0, num_steps: 20},
    character.reference_image_url
  );
  if (!buffer) return null;

  const outDir = path.join(__dirname, '..', 'public', 'outputs', 'characters', String(userId));
  await ensureDir(outDir);
  const filename = `${Date.now()}_${character.id}.png`;
  const abs = path.join(outDir, filename);
  await fs.promises.writeFile(abs, buffer);

  const publicUrl = `${process.env.APP_URL || 'http://localhost:3000'}/outputs/characters/${userId}/${filename}`;
  return { buffer, filePath: abs, publicUrl };
};

/**
 * Generate background image (if you prefer AI-generated backgrounds)
 */
// exports.generateBackground = async ({ userId, backgroundPrompt, width, height, model_url }) => {
//   const prompt = `Background scene: ${backgroundPrompt}. No characters.`;
//   const buffer = await paidGenerateImageService(
//     { prompt, width, height, strength: 0.6, guidance: 7.5 },
//     model_url,
//     null
//   );
//   if (!buffer) return null;

//   const outDir = path.join(__dirname, '..', 'public', 'outputs', 'backgrounds', String(userId));
//   await ensureDir(outDir);
//   const filename = `${Date.now()}_bg.png`;
//   const abs = path.join(outDir, filename);
//   await fs.promises.writeFile(abs, buffer);

//   const publicUrl = `${process.env.APP_URL || 'http://localhost:3000'}/outputs/backgrounds/${userId}/${filename}`;
//   return { buffer, filePath: abs, publicUrl };
// };

/**
 * Compose character layers over a background buffer.
 */
exports.composeScene = async ({ userId, characterLayers }) => {
  const outDir = path.join(__dirname, '..', 'public', 'outputs', 'scenes', String(userId));
  await ensureDir(outDir);

  const outPath = await composeLayers({
    layers: characterLayers.map(c => ({ input: c.buffer, top: c.top || 0, left: c.left || 0 })),
    outDir
  });

  const filename = path.basename(outPath);
  const publicUrl = `${process.env.APP_URL || 'http://localhost:3001'}/outputs/scenes/${userId}/${filename}`;
  return { outPath, publicUrl };
};

