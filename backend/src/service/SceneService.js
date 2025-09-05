// services/sceneService.js
const db = require('../config/connectDatabase');
const { paidGenerateImageService } = require("../service/PaidGenerateImageService");

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

