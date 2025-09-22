const { generateSceneService, getScenesService, getScenesByStoryService, deleteSceneByIdService } = require("../service/SceneService");


exports.generateSceneController= async (req, res) => {
  const { story_id, prompt } = req.body;
  const user_id = req.user.id;

  //check if story_id is provided
  if(!story_id) return res.status(400).json({ success: false, message: 'story_id required' });
  //check if prompt is provided
  if(!prompt) return res.status(400).json({ success: false, message: 'prompt required' });

  const result = await generateSceneService(user_id, story_id, prompt);
  return res.status(result.status).json(result);
};

exports.getScenesByStoryController = async (req, res) => {
  const { story_id } = req.query;
  const user_id = req.user.id;
  const result = await getScenesByStoryService(user_id, story_id);
  return res.status(result.status).json(result);
};

exports.deleteSceneByIdController = async (req, res) => {
  const { scene_id } = req.body;
  const user_id = req.user.id;
  const result = await deleteSceneByIdService(user_id, scene_id);
  return res.status(result.status).json(result);
};























// exports.generateSceneController = async (req, res) => {
//   const { user_id, character_id, pose_id, expression_id, prompt } = req.body;
//   const result = await generateSceneService(user_id, character_id, pose_id, expression_id, prompt);
//   return res.status(result.status).json(result);
// };

// exports.generateSceneController = async (req, res) => {
//   const { user_id, characters, prompt } = req.body;
//   const result = await generateSceneService(user_id, characters, prompt);
//   return res.status(result.status).json(result);
// };


// exports.getScenesController = async (req, res) => {
//   const { user_id } = req.query;
//   const result = await getScenesService(user_id);
//   return res.status(result.status).json(result);
// };

const fs = require('fs');
const path = require('path');
const {
  createSceneRow, attachSceneCharacterRow, updateSceneCharacterImage, updateSceneComposite,
  generateCharacterLayer,  composeScene
} = require('../service/SceneService');
const { getCharacterById } = require('../service/CharacterService');
const { handelAspectRatio } = require('../service/UserService');

/**
 * POST /scenes/generate-layered
 * Body:
 * {
 *   story_id: number,
 *   background_prompt?: string,
 *   background_image_url?: string,  // if you already have a BG
 *   model_url: string,              // e.g. "@cf/runwayml/stable-diffusion-v1-5-img2img"
 *   quality: "low|medium|high",
 *   aspect_ratio: "1:1|3:4|4:3|16:9",
 *   characters: [
 *     { character_id: 1, emotion: "angry", pose: "fighting", top: 50, left: 100 },
 *     { character_id: 2, emotion: "surprised", pose: "pointing", top: 80, left: 300 }
 *   ]
 * }
 */
exports.generateLayeredSceneController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      story_id,
     
      model_url,
      quality,
      aspect_ratio,
      characters = []
    } = req.body;

    if (!story_id || !model_url || !characters.length) {
      return res.status(400).json({ message: 'story_id, model_url, and characters[] required' });
    }

    const { width, height } = handelAspectRatio(quality, aspect_ratio);

    // 1) Create scene row
    const scene_id = await createSceneRow({
      story_id,
      user_id,
      meta: { quality, aspect_ratio, width, height, model_url }
    });

    // 3) Generate character layers
    const characterLayers = [];
    for (const [idx, c] of characters.entries()) {
      const character = await getCharacterById(c.character_id, user_id);
      console.log("character :",character)
      if (!character) return res.status(404).json({ message: `Character ${c.character_id} not found` });
      if (!character.reference_image_url) return res.status(400).json({ message: `Character ${character.id} missing reference image` });

      const layer = await generateCharacterLayer({
        userId: user_id,
        character,
        emotion: c.emotion,
        pose: c.pose,
        width,
        height,
        model_url
      });
      if (!layer) return res.status(500).json({ message: `Failed to generate character layer for id ${character.id}` });

      // attach row and update with URL
      const rowId = await attachSceneCharacterRow({
        scene_id,
        character_id: character.id,
        emotion: c.emotion,
        pose: c.pose,
        layer_index: idx,
        generated_image_url: layer.publicUrl
      });

      // record layer with positioning for composition
      characterLayers.push({ buffer: await fs.promises.readFile(layer.filePath), top: c.top || 0, left: c.left || 0 });
      await updateSceneCharacterImage(rowId, layer.publicUrl);
    }

    // 4) Compose final scene
    const composed = await composeScene({ userId: user_id,  characterLayers });
    await updateSceneComposite(scene_id, composed.publicUrl);

    res.status(200).json({
      success: true,
      scene_id,
      composite_url: composed.publicUrl
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Scene generation failed', error: e.message });
  }
};

