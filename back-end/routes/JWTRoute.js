const express = require('express')
const { refreshToken } = require('../service/JWTtokenGeneration');
const router = express.Router();

router.route('/refresh-token').post(refreshToken);

module.exports = router;