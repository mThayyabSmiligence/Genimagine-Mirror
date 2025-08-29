const express = require("express");
const { generateSceneController, getScenesController } = require("../controller/SceneController");

const router = express.Router();

router.post("/generate", generateSceneController);
router.get("/list", getScenesController);

module.exports = router;
