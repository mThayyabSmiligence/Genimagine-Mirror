const express = require('express');
const { banUserController, unbanUserController, suspendUserController, unsuspendUserController, warnUserController, deleteUserController, getUserByIdController } = require('../controller/UsersController');
const { getAllReportedImagesController, getReportedImageDetail, takeActionOnReportedImage, banReportedImageUserController, suspendReportedImageUserController, warnReportedImageUserController } = require('../controller/ReportImageController');
const router = express.Router();
router.route('/:user_id/getuser').get(getUserByIdController)
router.route('/:user_id/ban').post(banUserController);
router.route('/:user_id/unban').post(unbanUserController);
router.route('/:user_id/suspend').post(suspendUserController);
router.route('/:user_id/unsuspend').post(unsuspendUserController);
router.route('/:user_id/warn').post(warnUserController);
router.route("/:user_id/delete").post(deleteUserController);

// 
router.route("/getreportedimages").post(getAllReportedImagesController);
router.route("/getreportdetail/:report_id").post(getReportedImageDetail);
// router.route("/report/:report_id/action").post(takeActionOnReportedImage);



// Moderator Actions on Reported Images
router.route("/report/:report_id/ban").post(banReportedImageUserController);
router.route("/report/:report_id/suspend").post(suspendReportedImageUserController);
router.route("/report/:report_id/warn").post(warnReportedImageUserController);

// Optional: delete the reported image

// router.route("/report/:report_id/delete-image").delete(deleteReportedImageController);


module.exports = router;