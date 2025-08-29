const { generateSceneService, getScenesService } = require("../service/SceneService");

// exports.generateSceneController = async (req, res) => {
//   const { user_id, character_id, pose_id, expression_id, prompt } = req.body;
//   const result = await generateSceneService(user_id, character_id, pose_id, expression_id, prompt);
//   return res.status(result.status).json(result);
// };

exports.generateSceneController = async (req, res) => {
  const { user_id, characters, prompt } = req.body;
  const result = await generateSceneService(user_id, characters, prompt);
  return res.status(result.status).json(result);
};


exports.getScenesController = async (req, res) => {
  const { user_id } = req.query;
  const result = await getScenesService(user_id);
  return res.status(result.status).json(result);
};
