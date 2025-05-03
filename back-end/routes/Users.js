const express = require('express')
const { getUsersList, getSingleUser, userLogout, firstTimeVerification, getChatsList, getChatsData, addToLibraryController, getLibraryImagesController, deleteFromLibraryController, deleteImageController, editUserController, getCurrentUserDataController, passwordChangeController, editChatNameController, deleteChatController, getAllAspectRatiosController, getAllModelsController, getAllQualityLevelsController, getAllStylesController, getImageSettingsController} = require('../controller/UsersController');
const { paidGenerateImageService } = require('../service/PaidGenerateImageService');
const { userGenerateImageController } = require('../controller/UserGenerateImageController');
const { buyCreditsPackageController } = require('../controller/CreditController');
const { publishToExploreController, ViewExploreImageController, LikeExploreImageController, UnlikeExploreImageController, getExploreImagesByUserId, getExploreImageByUserIdController, deleteExploreImageByPublishedIdController, editCaptionController, ImageReportController } = require('../controller/ExploreController');
const { getExploreImagesByUserIdService } = require('../service/ExploreService');
const { RayzorPayOrderController, validatePaymentController, handelFailedPaymentController } = require('../controller/RayzorPayController');
const { submitFeedbackController } = require('../controller/UserFeedbackController');
const { getAspectRatioShape } = require('../service/UserService');
const router = express.Router();

router.route('/edit-user').post(editUserController)

router.route('/change-password').post(passwordChangeController)

router.route('/list').get(getUsersList);
router.route('/user-data').get(getCurrentUserDataController)
router.route('/id/:id').get(getSingleUser);
router.route('/verify-token').get(firstTimeVerification);
router.route('/generate-image').post(userGenerateImageController);
router.route('/get-chats-list').get(getChatsList)
router.route('/get-chat-data/:chatId').get(getChatsData)
router.route('/edit-chat-name').post(editChatNameController)

router.route('/delete-image/:image_id').delete(deleteImageController)
router.route('/delete-chat/:chat_id').delete(deleteChatController)


router.route('/buy-credits/:package_id').put(buyCreditsPackageController)

router.route('/order').post(RayzorPayOrderController)
router.route('/validate-payment').post(validatePaymentController)

router.route('/falied-payment').post(handelFailedPaymentController)

router.route('/add-to-library/:image_id').put(addToLibraryController)
router.route(`/get-library-images`).get(getLibraryImagesController)
router.route(`/delete-from-library/:image_id`).delete(deleteFromLibraryController)


//explore page routes
router.route('/publish-to-explore').post(publishToExploreController);
router.route('/explore/:published_id/like').post(LikeExploreImageController)
router.route('/explore/:published_id/unlike').post(UnlikeExploreImageController)

router.route("/explore").get(getExploreImageByUserIdController)
router.route("/explore/:published_id").delete(deleteExploreImageByPublishedIdController)

router.route('/explore/edit-caption/:published_id').post(editCaptionController)
router.route('/report-image').post(ImageReportController)
router.route("/submitfeedback").post(submitFeedbackController);


module.exports = router;