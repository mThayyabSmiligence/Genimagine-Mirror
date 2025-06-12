const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const { getAllReportedImagesService, getReportedImageDetailByReportIdService, banReportedImageUserService, suspendReportedImageUserService, warnReportedImageUserService, deleteImageAndReferences, deleteReportedImageService, markReportedImageAsNoAction, getReportedImagesByUserService, getUserListWithReportCountService, getUserReportedImageCountsService } = require('../service/ReportImageService');


// exports.getUserListWithReportCountController = async(req, res) => {
//   const result = await getUserListWithReportCountService()
  
//   return res.status(result.status).json(result); 
// }

exports.getUserReportedImageCountsController = async(req, res) => {
  const result = await getUserReportedImageCountsService()

  return res.status(result.status).json(result); 
}

exports.getAllReportedImagesController = async(req, res ) => { 
    const reportedImages = await getAllReportedImagesService();

    return res.status(reportedImages.status).json(reportedImages);      
}

exports.getReportedImageDetail = async (req, res) => {
  const { report_id } = req.params;

  const getReportedImageDetail = await  getReportedImageDetailByReportIdService(report_id)

  return res.status(getReportedImageDetail.status).json(getReportedImageDetail)
}

// exports.getReportedImagesByUserController = async(req, res) => {
//     const {userId} = req.params;

//     const result = getReportedImagesByUserService(userId)

//     return res.status(result.status).json(result)
// }

// exports.takeActionOnReportedImage = async (req, res) => {
//     const { report_id } = req.params;
//     const action_taken_by = req.user?.id;
//     const action_taken_by_role = req.user?.role;
//     const { action_type, reason, minutes } = req.body;
  
//     const result = await handleReportedImageActionService(report_id, action_type, action_taken_by,action_taken_by_role, { reason, minutes });
  
//     res.status(result.status).json(result);
//   };

exports.banReportedImageUserController = async (req, res) => {
    const { report_id } = req.params;
    const action_taken_by = req.user?.id;
    const result = await banReportedImageUserService(report_id, action_taken_by);
    res.status(result.status).json(result);
  };
  
  exports.suspendReportedImageUserController = async (req, res) => {
    const { report_id } = req.params;
    const action_taken_by = req.user?.id;
    const { minutes, reason } = req.body;
    const result = await suspendReportedImageUserService(report_id, action_taken_by, { minutes, reason });
    res.status(result.status).json(result);
  };
  
  exports.warnReportedImageUserController = async (req, res) => {
    const { report_id } = req.params;
    const action_taken_by = req.user?.id;
    const action_taken_by_role = req.user?.role;
    const { reason } = req.body;
    const result = await warnReportedImageUserService(report_id, action_taken_by, action_taken_by_role, reason);
    res.status(result.status).json(result);
  };

  exports.noActionReportedImageController = async (req, res) => {
    const { report_id } = req.params;
    const action_taken_by = req.user?.id;
  
    const result = await markReportedImageAsNoAction(report_id, action_taken_by);
    res.status(result.status).json(result);
  };

  exports.deleteReportedImageController = async (req, res) => {
    
    console.log("image_id")
    const { report_id } = req.params;
    const { image_id, published_id, image_path, reason } = req.body;
    const userId = req.user?.id;
    console.log("image_id")


    if (!image_id || !published_id || !image_path) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: image_id, published_id, or image_path'
      });
    }

    const result = await deleteReportedImageService(report_id, image_id, published_id, image_path, userId, reason);
    res.status(result.status).json(result);
  }