// const { Sequelize, VideoReport, StoryToVideo, ExploreVideo, Story, Scene, User } = require("../models");
// const sequelize = require("../config/database");

// const formatReportedVideos = (reports) => {
//   return reports.map((report) => ({
//     report_id: report.report_id,
//     video_id: report.video_id,
//     published_id: report.published_id,
//     report_details: report.report_details,
//     report_count: report.report_count,
//     uploader_id: report.published_video?.user_id || null,
//     uploader_name: report.published_video?.uploader?.username || null,
//     video_url: report.video?.video_url || null,
//     story_name: report.video?.story?.name || null,
//     description: report.video?.story?.description || null,
//     thumbnail: report.dataValues.thumbnail || null,
//     action_type: report.action_type,
//     action_taken_by: report.action_taken_by,
//     action_taken_at: report.action_taken_at,
//     reported_at: report.reported_at,
//   }));
// };

// exports.getAllReportedVideosService = async () => {
//   try {
//     const reports = await VideoReport.findAll({
//       order: [["reported_at", "DESC"]],
//       attributes: [
//         "report_id",
//         "video_id",
//         "published_id",
//         "report_details",
//         "report_count",
//         "action_type",
//         "action_taken_by",
//         "action_taken_at",
//         "reported_at",
//         // Get thumbnail from story or first scene
//         [
//           Sequelize.fn(
//             "COALESCE",
//             Sequelize.col("video.story.thumbnail"),
//             Sequelize.fn("MIN", Sequelize.col("video.story.scenes.image_url"))
//           ),
//           "thumbnail"
//         ],
//       ],
//       include: [
//         {
//           model: StoryToVideo,
//           as: "video",
//           attributes: ["video_url"],
//           include: [
//             {
//               model: Story,
//               as: "story",
//               attributes: ["name", "description", "thumbnail"],
//               include: [
//                 {
//                   model: Scene,
//                   as: "scenes",
//                   attributes: [],
//                   required: false,
//                   where: { deleted_at: null },
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           model: ExploreVideo,
//           as: "published_video",
//           attributes: ["user_id"],
//           include: [
//             {
//               model: User,
//               as: "uploader",
//               attributes: ["username"],
//             },
//           ],
//         },
//       ],
//       group: [
//         "VideoReport.report_id",
//         "video.id",
//         "video->story.id",
//         "published_video.id",
//         "published_video->uploader.user_id",
//       ],
//       subQuery: false,
//     });

//     const formattedReports = formatReportedVideos(reports);

//     return {
//       success: true,
//       reports: formattedReports,
//       message: "Fetched all reported videos successfully",
//       status: 200,
//     };
//   } catch (error) {
//     console.error("Error fetching reported videos:", error);
//     return {
//       success: false,
//       message: "Failed to fetch reported videos",
//       status: 500,
//     };
//   }
// };