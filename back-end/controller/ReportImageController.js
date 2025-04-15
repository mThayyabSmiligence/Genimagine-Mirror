const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const { getAllReportedImagesService, getReportedImageDetailByReportIdService, handleReportedImageActionService } = require('../service/ReportImageService');

exports.getAllReportedImagesController = async(req, res ) => { 
    const reportedImages = await getAllReportedImagesService();

    return res.status(reportedImages.status).json(reportedImages);      
}

exports.getReportedImageDetail = async (req, res) => {
  const { report_id } = req.params;

  const getReportedImageDetail = await  getReportedImageDetailByReportIdService(report_id)

  return res.status(getReportedImageDetail.status).json(getReportedImageDetail)
}

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