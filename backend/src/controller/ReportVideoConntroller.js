const { getAllReportedVideosService } = require("../service/ReportVideoService");

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