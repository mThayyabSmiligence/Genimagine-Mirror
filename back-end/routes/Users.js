const express = require('express')
const { getUsersList, getSingleUser, userLogout, firstTimeVerification } = require('../controller/UsersController');
const { paidGenerateImageService } = require('../service/PaidGenerateImageService');
const { userGenerateImageController } = require('../controller/UserGenerateImageController');
const router = express.Router();

router.route('/list').get(getUsersList);
router.route('/id/:id').get(getSingleUser);
router.route('/verify-token').get(firstTimeVerification);
router.route('/generate-image').post(userGenerateImageController);


module.exports = router;