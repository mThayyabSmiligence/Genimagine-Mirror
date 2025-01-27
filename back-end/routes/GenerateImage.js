const express = require('express')
const { generateImageApiCall } = require('../controller/GenerateImageController')
const router = express.Router();

router.route('/generate-image').post(generateImageApiCall);

module.exports = router;