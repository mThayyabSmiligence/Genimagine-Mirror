const express = require('express')
const { getUsersList, getSingleUser, userLogout, firstTimeVerification, getChatsList, getChatsData, addToLibraryController, getLibraryImagesController, deleteFromLibraryController, deleteImageController } = require('../controller/UsersController');
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

router.route('/delete-image/:image_id').delete(deleteImageController)


router.route('/buy-credits/:package_id').put(buyCreditsPackageController)

router.route('/add-to-library/:image_id').put(addToLibraryController)
router.route(`/get-library-images`).get(getLibraryImagesController)
router.route(`/delete-from-library/:image_id`).delete(deleteFromLibraryController)

router.route('/publish-to-explore').get();



module.exports = router;