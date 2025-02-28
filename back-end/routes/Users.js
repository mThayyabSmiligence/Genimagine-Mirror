const express = require('express')
const { getUsersList, getSingleUser, userLogout, firstTimeVerification, getChatsList, getChatsData, addToLibraryController, getLibraryImagesController, deleteFromLibraryController, deleteImageController, editUserController, getCurrentUserDataController} = require('../controller/UsersController');
const { paidGenerateImageService } = require('../service/PaidGenerateImageService');
const { userGenerateImageController } = require('../controller/UserGenerateImageController');
const { buyCreditsPackageController } = require('../controller/CreditController');
const { publishToExploreController, ViewExploreImageController, LikeExploreImageController, UnlikeExploreImageController, getExploreImagesByUserId, getExploreImageByUserIdController, deleteExploreImageByPublishedIdController } = require('../controller/ExploreController');
const { getExploreImagesByUserIdService } = require('../service/ExploreService');
const { RayzorPayOrderController, validatePaymentController } = require('../controller/RayzorPayController');
const router = express.Router();

router.route('/edit-user').post(editUserController)

router.route('/list').get(getUsersList);
router.route('/user-data').get(getCurrentUserDataController)
router.route('/id/:id').get(getSingleUser);
router.route('/verify-token').get(firstTimeVerification);
router.route('/generate-image').post(userGenerateImageController);
router.route('/get-chats-list').get(getChatsList)
router.route('/get-chat-data/:chatId').get(getChatsData)

router.route('/delete-image/:image_id').delete(deleteImageController)


router.route('/buy-credits/:package_id').put(buyCreditsPackageController)

router.route('/order').post(RayzorPayOrderController)
router.route('/validate-payment').post(validatePaymentController)

router.route('/add-to-library/:image_id').put(addToLibraryController)
router.route(`/get-library-images`).get(getLibraryImagesController)
router.route(`/delete-from-library/:image_id`).delete(deleteFromLibraryController)

//explore page routes
router.route('/publish-to-explore').post(publishToExploreController);
router.route('/explore/:published_id/like').post(LikeExploreImageController)
router.route('/explore/:published_id/unlike').post(UnlikeExploreImageController)

router.route("/explore").get(getExploreImageByUserIdController)
router.route("/explore/:published_id").delete(deleteExploreImageByPublishedIdController)
 

module.exports = router;