const { VideoReport } = require('../models');

exports.getAllReportedVideosService = async () => {
  try {
    const reports = await VideoReport.findAll({
      order: [["reported_at", "DESC"]],
    });

    console.log("reports:" , reports)
    return {
      success: true,
      reports,
      message: "Fetched all reported videos successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching reported videos:", error);
    return {
      success: false,
      message: "Failed to fetch reported videos",
      status: 500,
    };
  }
};