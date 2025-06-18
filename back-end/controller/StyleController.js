const { getAllStylesService, createStyleService, updateStyleService, deleteStyleService, getStyleByIdService } = require("../service/StyleService");

exports.getAllStylesController = async (req, res) => {
  const result = await getAllStylesService();
  return res.status(result.status).json(result);
};

exports.getStyleByIdController = async (req, res) => {
  const {style_id} = req.params;
  const result = await getStyleByIdService(style_id);
  return res.status(result.status).json(result);
};


// exports.createStyleController = async (req, res) => {
//   const result = await createStyleService(req.body);
//   return res.status(result.status).json(result);
// };

// exports.updateStyleController = async (req, res) => {
//   const {style_id} = req.params
//   const result = await updateStyleService(style_id, req.body);
//   return res.status(result.status).json(result);
// };

exports.createStyleController = async (req, res) => {
  const file = req.file;
  const result = await createStyleService(req.body, file);
  return res.status(result.status).json(result);
};

exports.updateStyleController = async (req, res) => {
  const { style_id } = req.params;
  const file = req.file;
  const result = await updateStyleService(style_id, req.body, file);
  return res.status(result.status).json(result);
};

exports.deleteStyleController = async (req, res) => {
  const {style_id} = req.params;
  const result = await deleteStyleService(style_id);
  return res.status(result.status).json(result);
};