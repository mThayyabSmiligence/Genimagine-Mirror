const express = require('express');
const { banUserController, unbanUserController, suspendUserController, unsuspendUserController, warnUserController, deleteUserController, getUserByIdController } = require('../controller/UsersController');
const { getAllReportedImagesController, getReportedImageDetail, banReportedImageUserController, suspendReportedImageUserController, warnReportedImageUserController, deleteReportedImageController, noActionReportedImageController, getReportedImagesByUserController, getUserListWithReportCountController, getUserReportedImageCountsController } = require('../controller/ReportImageController');
const { getAllFeedbacksController, respondToFeedbackController, escalateFeedbackController, updateFeedbackStatusController } = require('../controller/UserFeedbackController');
const { getModeratorDetailController } = require('../controller/ModeratorController');
const { getAllReportedVideosController } = require('../controller/ReportVideoConntroller');
const router = express.Router();
// user management
// router.route('/user-report-list').get(getUserListWithReportCountController);
router.route('/user-reported-image-counts').get(getUserReportedImageCountsController);
router.route('/:user_id/getuser').get(getUserByIdController)
router.route('/:user_id/ban').post(banUserController);
router.route('/:user_id/unban').post(unbanUserController);
router.route('/:user_id/suspend').post(suspendUserController);
router.route('/:user_id/unsuspend').post(unsuspendUserController);
router.route('/:user_id/warn').post(warnUserController);
router.route("/:user_id/delete").post(deleteUserController);


// reports management
router.route("/getreportedimages").post(getAllReportedImagesController);
router.route("/getreportdetail/:report_id").post(getReportedImageDetail);

// video report management
router.route("/reported-videos").get(getAllReportedVideosController);
router.route("/reported-video/:report_id").get(getReportedVideoDetailByReportIdController)
// video report actions
router.route("reported-video/:report_id/ban").post()
router.route("reported-video/:report_id/suspend").post()
router.route("reported-video/:report_id/warn").post()
router.route("reported-video/:report_id/no-action").post()
router.route("reported-video/:report_id/delete").post()

// router.route('/reported-images/user/:userId').get(getReportedImagesByUserController);
// Moderator Actions on Reported Images
router.route("/report/:report_id/ban").post(banReportedImageUserController);
router.route("/report/:report_id/suspend").post(suspendReportedImageUserController);
router.route("/report/:report_id/warn").post(warnReportedImageUserController);
router.route("/report/:report_id/no-action").post(noActionReportedImageController);
router.route("/report/image/delete/:report_id").post(deleteReportedImageController);


// feedbacks management
router.route("/getfeedbacks").post(getAllFeedbacksController);
router.route("/respond/:id").post(respondToFeedbackController);
router.route("/updatestatus/:id").post(updateFeedbackStatusController);
router.route("/escalate/:id").post(escalateFeedbackController);

// moderatr detail
router.route('/get-moderator-detail').post(getModeratorDetailController);
// router.route('/update-moderator-profile-image').post(updateModeratorProfileImageController);


module.exports = router;