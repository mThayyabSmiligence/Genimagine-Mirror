const express = require('express')
const { getUsersList, getSingleUser, userLogout, firstTimeVerification, getChatsList, getChatsData, addToLibraryController, getLibraryImagesController, deleteFromLibraryController, deleteImageController, editUserController, getCurrentUserDataController, passwordChangeController, editChatNameController, deleteChatController, getAllAspectRatiosController, getAllModelsController, getAllQualityLevelsController, getAllStylesController, getImageSettingsController, generateImageWithStabilityController, scheduleImageGenerationController, getUserScheduledTasksController, toggleScheduledTaskStatusController, deleteScheduledTaskController, updateScheduledTaskStatusController} = require('../controller/UsersController');
const { paidGenerateImageService } = require('../service/PaidGenerateImageService');
const { userGenerateImageController } = require('../controller/UserGenerateImageController');
const { buyCreditsPackageController, getCreditTopUpController, getUserPurchasedTopUp, getTotalActiveCreditsController } = require('../controller/CreditController');
const { publishToExploreController, ViewExploreImageController, LikeExploreImageController, UnlikeExploreImageController, getExploreImagesByUserId, getExploreImageByUserIdController, deleteExploreImageByPublishedIdController, editCaptionController, ImageReportController } = require('../controller/ExploreController');
const { getExploreImagesByUserIdService } = require('../service/ExploreService');
const { RayzorPayOrderController, validatePaymentController, handelFailedPaymentController } = require('../controller/RayzorPayController');
const { submitFeedbackController } = require('../controller/UserFeedbackController');
const { getAspectRatioShape } = require('../service/UserService');
const { getAllPlansController, getPlanByIdController, subscribeToPlanController, getUserPlanStatusContoller } = require('../controller/PlanController');
const { getImageToPromptConversationHistoryController, upload } = require('../controller/ImagetoPromptController');
const { createCharacterController, addExpressionController, addPoseController, getCharactersController, getUserCharactersController, uploadReferenceController, uploadMiddleware, generateCharacterController, getCharactersByStoryController, saveCharacterController, regenerateCharacterController, getCharactersByUserController, softDeleteCharacterController, forceDeleteCharacterController, restoreCharacterController, uploadCharacterImageController, reuploadCharacterImageController, characterCollageController } = require('../controller/CharacterController');
const { generateSceneController, getScenesController, generateLayeredSceneController, getScenesByStoryController, deleteSceneByIdController, regenerateSceneController } = require('../controller/SceneController');
const { createStoryController, getUserStoriesController, getStoryByIdController, updateStoryController, deleteStoryController } = require('../controller/StoryController');
const characterUpload= require('../middle_ware/uploadCharacter');
const { createAutoStoryController, getstatus, getStoryStatus } = require('../controller/AutoStoryController');
const { createStoryToVideoController, getStoryToVideoController, getStoryToVideoByStoryIdController } = require('../controller/StoryToVideoController');
const { publishVideoToExploreController } = require('../controller/ExploreVideoController');
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


// router.route('/buy-credits/:package_id').put(buyCreditsPackageController)

router.route('/order').post(RayzorPayOrderController)
router.route('/validate-payment').post(validatePaymentController)
router.route('/user/plan-status').get(getUserPlanStatusContoller)
router.route('/get-total-credits/:userId').get(getTotalActiveCreditsController)

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

router.route("/generatebySD").post( generateImageWithStabilityController )                                   //stability diffusion

router.route('/get-active-topUp').get(getCreditTopUpController)
router.route('/user/active-topups').get(getUserPurchasedTopUp)
router.route('/image-to-prompt').get(getImageToPromptConversationHistoryController);

router.route('/schedule-image-generation').post(scheduleImageGenerationController)
router.route('/get-scheduled-tasks').get( getUserScheduledTasksController);
router.route('/update-schedule/:id').post( updateScheduledTaskStatusController);
router.route('/delete-schedule/:id').post( deleteScheduledTaskController);


// // character route:
// router.post("/create", createCharacterController);
// router.post("/:characterId/expression", addExpressionController);
// router.post("/:characterId/pose", addPoseController);
// router.get("/list", getCharactersController);
// router.post('/characters/upload', uploadMiddleware, uploadReferenceController);
router.post('/characters/upload',upload, uploadReferenceController);
router.post('/characters',  createCharacterController);
router.get('/characters',  getUserCharactersController);

// scene route:
// router.post("/generate", generateSceneController);
// router.get("/list", getScenesController);
router.post('/scenes/generate-layered', generateLayeredSceneController);

// story route:
router.post('/create-story', createStoryController);
router.get('/get-all-story', getUserStoriesController);
router.get('/get-story/:id', getStoryByIdController);
router.post('/update-story/:id', updateStoryController);
router.post('/delete-story/:id', deleteStoryController);

router.post("/auto-story", createAutoStoryController);
router.get('/story/:id/status',getStoryStatus)

// character route:
router.get('/get-story-characters', getCharactersByStoryController)
router.get('/get-characters', getCharactersByUserController)
router.post('/generate-character-image', generateCharacterController)
router.post('/regenerate-character', regenerateCharacterController);
router.post('/upload-character-image', characterUpload, uploadCharacterImageController);
router.post('/reupload-character-image', characterUpload, reuploadCharacterImageController);
router.post('/delete-character', softDeleteCharacterController);
router.post('/force-delete-character', forceDeleteCharacterController);
router.post('/restore-character', restoreCharacterController);

// router.post('/save-character', saveCharacterController);

//scene route:
router.get('/scenes/storyId', getScenesByStoryController);
router.post('/scenes/generate', generateSceneController);
router.post('/scenes/delete', deleteSceneByIdController);
router.post('/scenes/regenerate', regenerateSceneController);

// story to video
router.post('/story-to-video/:id', createStoryToVideoController);
router.get('/story-to-video/:id', getStoryToVideoByStoryIdController)
router.post('/publish-video-to-explore', publishVideoToExploreController);

module.exports = router;