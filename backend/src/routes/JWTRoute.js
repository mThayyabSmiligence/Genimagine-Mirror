const express = require('express');
const { generateTokenWithRefreshToken } = require('../service/JWTtokenGeneration');
const { generateTokenWithRefreshTokenController } = require('../controller/AuthenticationController');
const router = express.Router();

router.route('/').post(generateTokenWithRefreshTokenController);

module.exports = router;