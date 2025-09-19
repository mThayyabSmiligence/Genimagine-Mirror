const { testGenerateCharacterExpressionImageService } = require("../service/CharacterExpressionService");

exports.testCharacterExpression = async (req, res) => {
    const { character_id, expression } = req.body;

    const characters = await testGenerateCharacterExpressionImageService(character_id, expression);
    return res.status(characters.status).json(characters);
}