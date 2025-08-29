const express = require("express");
const { createCharacterController, addExpressionController, addPoseController, getCharactersController } = require("../controller/CharacterController");

const router = express.Router();

router.post("/create", createCharacterController);
router.post("/:characterId/expression", addExpressionController);
router.post("/:characterId/pose", addPoseController);
router.get("/list", getCharactersController);

module.exports = router;
