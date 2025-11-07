const { Sequelize, VideoReport, StoryToVideo, ExploreVideo, Story, Scene, Users, Character } = require("../models");
const sequelize = require("../config/database");
const { banUserService, suspendUserService, warnUser } = require("./UserService");

const formatReportedVideos = (reports) => {
  return reports.map((report) => ({
    report_id: report.report_id,
    video_id: report.video_id,
    published_id: report.published_id,
    report_details: report.report_details,
    report_count: report.report_count,
    uploader_id: report.published_video?.user_id || null,
    uploader_name: report.published_video?.uploader?.username || null,
    video_url: report.video?.video_url || null,
    story_name: report.video?.story?.name || null,
    description: report.video?.story?.description || null,
    thumbnail: report.dataValues.thumbnail || null,
    action_type: report.action_type,
    action_taken_by: report.action_taken_by,
    action_taken_at: report.action_taken_at,
    reported_at: report.reported_at,
  }));
};

exports.getAllReportedVideosService = async () => {
  try {
    const reports = await VideoReport.findAll({
      order: [["reported_at", "DESC"]],
      attributes: [
        "report_id",
        "video_id",
        "published_id",
        "report_details",
        "report_count",
        "action_type",
        "action_taken_by",
        "action_taken_at",
        "reported_at",
        // Get thumbnail from story or first scene
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.col("video.story.thumbnail"),
            Sequelize.fn("MIN", Sequelize.col("video.story.scenes.image_url"))
          ),
          "thumbnail"
        ],
      ],
      include: [
        {
          model: StoryToVideo,
          as: "video",
          attributes: ["video_url"],
          include: [
            {
              model: Story,
              as: "story",
              attributes: ["name", "description", "thumbnail"],
              include: [
                {
                  model: Scene,
                  as: "scenes",
                  attributes: [],
                  required: false,
                  where: { deleted_at: null },
                },
              ],
            },
          ],
        },
        {
          model: ExploreVideo,
          as: "published_video",
          attributes: ["user_id"],
          include: [
            {
              model: Users,
              as: "uploader",
              attributes: ["username"],
            },
          ],
        },
      ],
      group: [
        "VideoReport.report_id",
        "video.id",
        "video->story.id",
        "published_video.id",
        "published_video->uploader.user_id",
      ],
      subQuery: false,
    });

    const formattedReports = formatReportedVideos(reports);

    return {
      success: true,
      reports: formattedReports,
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


// Helper function to format a single reported video detail
const formatReportedVideoDetail = (report) => {
  return {
    report_id: report.report_id,
    video_id: report.video_id,
    published_id: report.published_id,
    report_details: report.report_details,
    report_count: report.report_count,
    uploader_id: report.published_video?.user_id || null,
    uploader_name: report.published_video?.uploader?.username || null,
    video_url: report.video?.video_url || null,
    story_name: report.video?.story?.name || null,
    description: report.video?.story?.description || null,
    thumbnail: report.dataValues.thumbnail || null,
    action_type: report.action_type,
    action_taken_by: report.action_taken_by,
    action_taken_at: report.action_taken_at,
    reported_at: report.reported_at,
  };
};

exports.getReportedVideoDetailByReportIdService = async ({ report_id }) => {
  try {
    if (!report_id) {
      return {
        success: false,
        message: "Report ID is required",
        status: 400,
        frontendMessage: "Report ID is required",
      };
    }

    const report = await VideoReport.findByPk(report_id, {
      attributes: [
        "report_id",
        "video_id",
        "published_id",
        "report_details",
        "report_count",
        "action_type",
        "action_taken_by",
        "action_taken_at",
        "reported_at",
        // Get thumbnail from story or first scene
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.col("video.story.thumbnail"),
            Sequelize.fn("MIN", Sequelize.col("video.story.scenes.image_url"))
          ),
          "thumbnail"
        ],
      ],
      include: [
        {
          model: StoryToVideo,
          as: "video",
          attributes: ["video_url"],
          include: [
            {
              model: Story,
              as: "story",
              attributes: ["name", "description", "thumbnail"],
              include: [
                {
                  model: Scene,
                  as: "scenes",
                  attributes: [],
                  required: false,
                  where: { deleted_at: null },
                },
              ],
            },
          ],
        },
        {
          model: ExploreVideo,
          as: "published_video",
          attributes: ["user_id"],
          include: [
            {
              model: Users,
              as: "uploader",
              attributes: ["username"],
            },
          ],
        },
      ],
      group: [
        "VideoReport.report_id",
        "video.id",
        "video->story.id",
        "published_video.id",
        "published_video->uploader.user_id",
      ],
      subQuery: false,
    });

    if (!report) {
      return {
        success: false,
        message: "Report not found",
        status: 404,
        frontendMessage: "Report not found",
      };
    }

    const formattedReport = formatReportedVideoDetail(report);

    return {
      success: true,
      data: formattedReport,
      message: "Report details fetched successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching report details:", error);
    return {
      success: false,
      message: "Failed to fetch report details",
      status: 500,
      frontendMessage: "Failed to fetch report details",
    };
  }
};





// Helper function to get uploader from video report
const getUploaderFromReport = async (report_id) => {
  console.log("get upload from report")
  const report = await VideoReport.findByPk(report_id, {
    attributes: ["video_id"],
    include: [
      {
        model: StoryToVideo,
        as: "video",
        attributes: ["user_id"],
      },
    ],
  });

  if (!report) return null;

  return {
    video_id: report.video_id,
    user_id: report.video?.user_id,
  };
};

exports.banReportedVideoUserService = async (report_id, action_taken_by) => {
  try {
    console.log("ban video")
    const uploader = await getUploaderFromReport(report_id);
    if (!uploader) {
      return { status: 404, success: false, message: "Report not found." };
    }

    const result = await banUserService(uploader.user_id, action_taken_by);
    console.log("report result", result)
    if (!result.success) {
      return result;
    }

    await VideoReport.update(
      {
        action_type: "ban",
        action_taken_by,
        action_taken_at: new Date(),
      },
      { where: { report_id } }
    );

    return {
      status: 200,
      success: true,
      message: "User banned successfully for reported video.",
    };
  } catch (error) {
    console.error("Error banning user for video report:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to ban user",
      error: error.message,
    };
  }
};

exports.suspendReportedVideoUserService = async (
  report_id,
  action_taken_by,
  { minutes, reason }
) => {
  try {
    if (!minutes || !reason) {
      return {
        status: 400,
        success: false,
        message: "Suspension requires 'minutes' and 'reason'.",
      };
    }

    const uploader = await getUploaderFromReport(report_id);
    if (!uploader) {
      return { status: 404, success: false, message: "Report not found." };
    }

    const result = await suspendUserService(
      uploader.user_id,
      minutes,
      reason,
      action_taken_by
    );

    if (!result.success) {
      return result;
    }

    await VideoReport.update(
      {
        action_type: "suspend",
        action_taken_by,
        action_taken_at: new Date(),
      },
      { where: { report_id } }
    );

    return {
      status: 200,
      success: true,
      message: "User suspended successfully for reported video.",
    };
  } catch (error) {
    console.error("Error suspending user for video report:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to suspend user",
      error: error.message,
    };
  }
};

exports.warnReportedVideoUserService = async (
  report_id,
  action_taken_by,
  action_taken_by_role,
  reason
) => {
  try {
    if (!reason) {
      return {
        status: 400,
        success: false,
        message: "Warning requires 'reason'.",
      };
    }

    const uploader = await getUploaderFromReport(report_id);
    if (!uploader) {
      return { status: 404, success: false, message: "Report not found." };
    }

    const result = await warnUser(
      uploader.user_id,
      reason,
      action_taken_by,
      action_taken_by_role
    );

    if (!result.success) {
      return result;
    }

    await VideoReport.update(
      {
        action_type: "warn",
        action_taken_by,
        action_taken_at: new Date(),
      },
      { where: { report_id } }
    );

    return {
      status: 200,
      success: true,
      message: "User warned successfully for reported video.",
    };
  } catch (error) {
    console.error("Error warning user for video report:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to warn user",
      error: error.message,
    };
  }
};

exports.noActionReportedVideoService = async (report_id, action_taken_by) => {
  try {
    const uploader = await getUploaderFromReport(report_id);
    if (!uploader) {
      return { status: 404, success: false, message: "Report not found." };
    }

    await VideoReport.update(
      {
        action_type: "no_action",
        action_taken_by,
        action_taken_at: new Date(),
      },
      { where: { report_id } }
    );

    return {
      status: 200,
      success: true,
      message: "Marked as no action required for reported video.",
    };
  } catch (error) {
    console.error("Error marking as no action for video report:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to mark as no action",
      error: error.message,
    };
  }
}




// Service - ReportVideoService.js



// Service - ReportVideoService.js
exports.deleteReportedVideoService = async (
  report_id,
  video_id,
  userId,
  reason
) => {
  try {
    // Get story_id from video
    const video = await StoryToVideo.findByPk(video_id);

    if (!video) {
      return {
        status: 404,
        success: false,
        message: "Video not found.",
      };
    }

    const story_id = video.story_id;

    // INSERT INTO moderator_video_actions
    await ModeratorVideoAction.create({
      video_id,
      action: "delete",
      reason,
      report_id,
      deleted_by: userId,
    });

    // Step 1: Delete from ExploreVideos
    await ExploreVideo.destroy({
      where: { story_id },
    });

    // Step 2: Delete from StoryToVideos
    await StoryToVideo.destroy({
      where: { id: video_id },
    });

    // Step 3: Delete from Scenes
    await Scene.destroy({
      where: { story_id },
    });

    // Step 4: Delete from Characters
    await Character.destroy({
      where: { story_id },
    });

    // Step 5: Delete from Story
    await Story.destroy({
      where: { id: story_id },
    });

    // Step 6: Delete from VideoReports
    await VideoReport.destroy({
      where: { report_id },
    });

    return {
      status: 200,
      success: true,
      message: "Video and all related data deleted successfully.",
    };
  } catch (error) {
    console.error("Service Error:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to delete video and related data.",
      error: error.message,
    };
  }
};
