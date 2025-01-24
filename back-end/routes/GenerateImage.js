const express = require('express')
const { generateImageApiCall } = require('../controller/GenerateImageController')
const router = express.Router();

router.route('/generate-image').get(generateImageApiCall);

module.exports = router;