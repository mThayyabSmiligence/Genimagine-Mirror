const express = require('express')
const { guestGenerateImageController } = require('../controller/GuestGenerateImageController');
const router = express.Router();

router.route('/generate-image').post(guestGenerateImageController);

module.exports = router;