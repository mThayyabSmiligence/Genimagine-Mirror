const { getAllReportedVideosService, getReportedVideoDetailByReportIdService, deleteReportedVideoService, banReportedVideoUserService, suspendReportedVideoUserService, warnReportedVideoUserService, noActionReportedVideoService } = require("../service/ReportVideoService");

exports.getAllReportedVideosController = async (req, res) => {
  try {
    const result = await getAllReportedVideosService();
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in getAllReportedVideosController:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching reports",
    });
  }
};

// controllers/ReportController.js

exports.getReportedVideoDetailByReportIdController = async (req, res) => {
  try {
    const { report_id } = req.params;

    if (!report_id) {
      return res.status(400).json({
        success: false,
        message: "report_id is required",
        status: 400,
        frontendMessage: "Report ID is required",
      });
    }

    const result = await getReportedVideoDetailByReportIdService({ report_id });

    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error fetching report details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reported video details",
      status: 500,
    });
  }
};




exports.banReportedVideoUserController = async (req, res) => {
  const { report_id } = req.params;
  const action_taken_by = req.user?.id;
  console.log("ban video with:", report_id, action_taken_by)
  const result = await banReportedVideoUserService(report_id, action_taken_by);
  res.status(result.status).json(result);
};

exports.suspendReportedVideoUserController = async (req, res) => {
  const { report_id } = req.params;
  const action_taken_by = req.user?.id;
  const { minutes, reason } = req.body;
  const result = await suspendReportedVideoUserService(report_id, action_taken_by, { minutes, reason });
  res.status(result.status).json(result);
};

exports.warnReportedVideoUserController = async (req, res) => {
  const { report_id } = req.params;
  const action_taken_by = req.user?.id;
  const action_taken_by_role = req.user?.role;
  const { reason } = req.body;
  const result = await warnReportedVideoUserService(report_id, action_taken_by, action_taken_by_role, reason);
  res.status(result.status).json(result);
};

exports.noActionReportedVideoController = async (req, res) => {
  const { report_id } = req.params;
  const action_taken_by = req.user?.id;
  const result = await noActionReportedVideoService(report_id, action_taken_by);
  res.status(result.status).json(result);
};


exports.deleteReportedVideoController = async (req, res) => {
  const { report_id } = req.params;
  const { video_id, story_id, reason } = req.body;
  const userId = req.user?.id;

  if (!video_id || !story_id) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: video_id or story_id",
      status: 400,
      frontendMessage: "Video ID and Story ID are required",
    });
  }

  const result = await deleteReportedVideoService(
    report_id,
    video_id,
    story_id,
    userId,
    reason
  );
  res.status(result.status).json(result);
};