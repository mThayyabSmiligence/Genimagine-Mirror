const { createCharacterService, addExpressionService, addPoseService, getCharactersService } = require("../service/CharacterService");

exports.createCharacterController = async (req, res) => {
  const { user_id, name, reference_image_url, description } = req.body;
  const result = await createCharacterService(user_id, name, reference_image_url, description);
  return res.status(result.status).json(result);
};

exports.addExpressionController = async (req, res) => {
  const { characterId } = req.params;
  const { emotion, reference_image_url } = req.body;
  const result = await addExpressionService(characterId, emotion, reference_image_url);
  return res.status(result.status).json(result);
};

exports.addPoseController = async (req, res) => {
  const { characterId } = req.params;
  const { pose_name, reference_image_url } = req.body;
  const result = await addPoseService(characterId, pose_name, reference_image_url);
  return res.status(result.status).json(result);
};

exports.getCharactersController = async (req, res) => {
  const { user_id } = req.query;
  const result = await getCharactersService(user_id);
  return res.status(result.status).json(result);
};
