exports.getCharactersByStoryController = async (req, res) => {
  const { storyId } = req.params;
  const characters = await getCharactersByStoryService(req.user.id, storyId);
  return res.status(characters.status).json(characters);
};

exports.generateCharacterController = async (req, res) => {
  const { story_id ,name ,description  } = req.body;
  const characters = await generateCharacterService(req.user.id, story_id, name, description);
  return res.status(characters.status).json(characters);
}

// const { createCharacterService, addExpressionService, addPoseService, getCharactersService } = require("../service/CharacterService");

// exports.createCharacterController = async (req, res) => {
//   const { user_id, name, reference_image_url, description } = req.body;
//   const result = await createCharacterService(user_id, name, reference_image_url, description);
//   return res.status(result.status).json(result);
// };

// exports.addExpressionController = async (req, res) => {
//   const { characterId } = req.params;
//   const { emotion, reference_image_url } = req.body;
//   const result = await addExpressionService(characterId, emotion, reference_image_url);
//   return res.status(result.status).json(result);
// };

// exports.addPoseController = async (req, res) => {
//   const { characterId } = req.params;
//   const { pose_name, reference_image_url } = req.body;
//   const result = await addPoseService(characterId, pose_name, reference_image_url);
//   return res.status(result.status).json(result);
// };

// exports.getCharactersController = async (req, res) => {
//   const { user_id } = req.query;
//   const result = await getCharactersService(user_id);
//   return res.status(result.status).json(result);
// };


// const multer = require('multer');
// const upload = multer({ dest: 'tmp/uploads/' });
const {  createCharacter, getUserCharacters, generateCharacterService } = require('../service/CharacterService');
const fs = require('fs');
const path = require('path');

// exports.uploadMiddleware = upload.single('referenceImage');

exports.uploadReferenceController = async (req, res) => {
  try {
    // Check if file exists (multer stores single file in req.file)
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log(req.file);

    const file = req.file; // multer stores in req.file
    const userId = req.user.id;
    const destFolder = path.join(__dirname, '..', 'public', 'uploads', 'characters', String(userId));
    await fs.promises.mkdir(destFolder, { recursive: true });

    // Use file.originalname instead of file.name
    const filename = `${Date.now()}_${file.originalname}`;
    const filePath = path.join(destFolder, filename);

    // Write buffer to file (since using memoryStorage)
    await fs.promises.writeFile(filePath, file.buffer);

    const appUrl = process.env.APP_URL || 'http://localhost:3001';
    const url = `${appUrl}/uploads/characters/${userId}/${filename}`;

    res.status(200).json({ success: true, url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};

exports.createCharacterController = async (req, res) => {
  try {
    const { name, description, reference_image_url } = req.body;
    if (!name || !reference_image_url) {
      return res.status(400).json({ success: false, message: 'name and reference_image_url required' });
    }
    const character = await createCharacter({ user_id: req.user.id, name, description, reference_image_url });
    res.status(201).json({ success: true, character });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Create character failed' });
  }
};

exports.getUserCharactersController = async (req, res) => {
  try {
    const characters = await getUserCharacters(req.user.id);
    res.status(200).json({ success: true, characters });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Fetch characters failed' });
  }
};
