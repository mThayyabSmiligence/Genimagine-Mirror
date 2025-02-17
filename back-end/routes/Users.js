const express = require('express')
const { getUsersList, getSingleUser, userLogout, firstTimeVerification, getChatsList, getChatsData } = require('../controller/UsersController');
const { paidGenerateImageService } = require('../service/PaidGenerateImageService');
const { userGenerateImageController } = require('../controller/UserGenerateImageController');
const { buyCreditsPackageController } = require('../controller/CreditController');
const router = express.Router();

router.route('/list').get(getUsersList);
router.route('/id/:id').get(getSingleUser);
router.route('/verify-token').get(firstTimeVerification);
router.route('/generate-image').post(userGenerateImageController);
router.route('/get-chats-list').get(getChatsList)
router.route('/get-chat-data/:chatId').get(getChatsData)


router.route('/buy-credits/:package_id').get(buyCreditsPackageController)



module.exports = router;