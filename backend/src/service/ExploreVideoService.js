const { Sequelize, where, Op } = require('sequelize');
const ExploreVideo = require("../models/ExploreVideo");
const StoryToVideo = require("../models/StoryToVideo");
const Story = require("../models/Story");
const Scene = require("../models/Scene");
const VideoReport = require('../models/VideoReport');


exports.publishVideoToExplore = async ({ story_id, user_id }) => {
  try {
    // Check if video exists and is ready
    const video = await StoryToVideo.findOne({
      where: {
        story_id,
        user_id,
        status: "done",
      },
    });

    if (!video) {
      return {
        success: false,
        message: "Video not found or not ready for publishing",
        status: 404,
      };
    }

    // Check if already published
    const existingPublish = await ExploreVideo.findOne({
      where: { story_id },
    });

    if (existingPublish) {
      return {
        success: false,
        message: "Video already published to explore",
        status: 409,
      };
    }

    // Publish video
    const publishedVideo = await ExploreVideo.create({
      user_id,
      story_id,

    });

    return {
      success: true,
      publishedVideo,
      message: "Video successfully published to explore",
      status: 200,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to publish video",
      status: 500,
    };
  }
};


/**
 * Get explore videos with pagination using Sequelize
 */



// exports.getExploreVideosService = async (page, user_id) => {
//   try {
//     const pageNumber = parseInt(page, 10) || 1;
//     const pageSize = 10;
//     const offset = (pageNumber - 1) * pageSize;

//     let videos;

//     // if (user_id == 0) {
//     //   // Unauthenticated user (no report data)
//     //   videos = await ExploreVideo.findAll({
//     //     attributes: [
//     //       "id",
//     //       "user_id",
//     //       "story_id",
//     //       "createdAt",
//     //       [
//     //         Sequelize.fn(
//     //           "COALESCE",
//     //           Sequelize.col("story.thumbnail"),
//     //           Sequelize.fn("MIN", Sequelize.col("story->scenes.image_url"))
//     //         ),
//     //         "thumbnail"
//     //       ],
//     //       [Sequelize.col("videoData.video_url"), "video_url"],
//     //       [Sequelize.col("videoData.video_path"), "video_path"],
//     //       [Sequelize.col("videoData.status"), "video_status"],
//     //       [Sequelize.col("videoData.id"), "video_id"]
//     //     ],
//     //     include: [
//     //       {
//     //         model: Story,
//     //         as: "story",
//     //         attributes: [],
//     //         include: [
//     //           {
//     //             model: Scene,
//     //             as: "scenes",
//     //             attributes: [],
//     //             required: false,
//     //             where: { deleted_at: null },
//     //           },
//     //         ],
//     //       },
//     //       {
//     //         model: StoryToVideo,
//     //         as: "videoData",
//     //         attributes: [],
//     //         required: true,
//     //       },
//     //     ],
//     //     group: ["ExploreVideo.id", "story.id", "videoData.id"],
//     //     order: [["createdAt", "DESC"]],
//     //     limit: pageSize,
//     //     offset: offset,
//     //     subQuery: false,
//     //   });
//     // } else {
//     //   // Authenticated user: also aggregate report data
//     //   videos = await ExploreVideo.findAll({
//     //     attributes: [
//     //       "id",
//     //       "user_id",
//     //       "story_id",
//     //       "createdAt",
//     //       [
//     //         Sequelize.fn(
//     //           "COALESCE",
//     //           Sequelize.col("story.thumbnail"),
//     //           Sequelize.fn("MIN", Sequelize.col("story->scenes.image_url"))
//     //         ),
//     //         "thumbnail"
//     //       ],
//     //       // ✅ Aggregate report info to satisfy ONLY_FULL_GROUP_BY
//     //       [
//     //         Sequelize.fn("GROUP_CONCAT", Sequelize.col("published_reports.report_id")),
//     //         "report_ids"
//     //       ],
//     //       [
//     //         Sequelize.fn("GROUP_CONCAT", Sequelize.col("published_reports.report_details")),
//     //         "report_details"
//     //       ],
//     //       [Sequelize.col("videoData.video_url"), "video_url"],
//     //       [Sequelize.col("videoData.video_path"), "video_path"],
//     //       [Sequelize.col("videoData.status"), "video_status"],
//     //       [Sequelize.col("videoData.id"), "video_id"]
//     //     ],
//     //     include: [
//     //       {
//     //         model: Story,
//     //         as: "story",
//     //         attributes: [],
//     //         include: [
//     //           {
//     //             model: Scene,
//     //             as: "scenes",
//     //             attributes: [],
//     //             required: false,
//     //             where: { deleted_at: null },
//     //           },
//     //         ],
//     //       },
//     //       {
//     //         model: StoryToVideo,
//     //         as: "videoData",
//     //         attributes: [],
//     //         required: true,
//     //       },
//     //       {
//     //         model: VideoReport,
//     //         as: "published_reports",
//     //         attributes: [],
//     //         required: false,
//     //       },
//     //     ],
//     //     group: ["ExploreVideo.id", "story.id", "videoData.id"], // ✅ Correct grouping
//     //     order: [["createdAt", "DESC"]],
//     //     limit: pageSize,
//     //     offset: offset,
//     //     subQuery: false,
//     //   });
//     // }

//      videos = await ExploreVideo.findAll({
//       attributes: [
//         "id",
//         "user_id",
//         "story_id",
//         "createdAt",
//         // Use COALESCE to get story thumbnail or first scene image
//         [
//           Sequelize.fn(
//             "COALESCE",
//             Sequelize.col("story.thumbnail"),
//             Sequelize.fn("MIN", Sequelize.col("story.scenes.image_url"))
//           ),
//           "thumbnail"
//         ],
//       ],
//       include: [
//         {
//           model: Story,
//           as: "story",
//           attributes: ["name", "thumbnail"],
//           required: true,
//           include: [
//             {
//               model: Scene,
//               as: "scenes",
//               attributes: [],
//               required: false,
//               where: { deleted_at: null },
//             },
//           ],
//         },
//         {
//           model: StoryToVideo,
//           as: "videoData",
//           attributes: ["video_url", "video_path", "status", 'id','subtitle_tracks', 'audio_tracks'],
//           required: true,
//         },
//       ],
//       group: ["ExploreVideo.id", "story.id", "videoData.id"],
//       order: [["createdAt", "DESC"]],
//       limit: pageSize,
//       offset: offset,
//       subQuery: false,
//     });

//     if (videos.length === 0) {
//       return {
//         status: 404,
//         message: "No videos found",
//         success: false,
//       };
//     }
//     console.log("unformateed videos:",videos)

//     // ✅ Format response
//     let formattedVideos = formatteVideoDate(videos);

//     // ✅ Mark videos reported by current user
//     // if (user_id != 0) {
//     //   formattedVideos = formattedVideos.map(video => {
//     //     const reports = video.report_details
//     //       ? JSON.parse(`[${video.report_details}]`.replace(/}\s*,\s*{/g, '},{')) // normalize JSON if multiple reports
//     //       : [];

//     //     const isUserReported = reports.some(r => r?.user_id == user_id);
//     //     return {
//     //       ...video,
//     //       isUserReported,
//     //     };
//     //   });
//     // }

//     return {
//       status: 200,
//       message: "Videos fetched successfully",
//       success: true,
//       videos: formattedVideos,
//       pagination: {
//         currentPage: pageNumber,
//         pageSize,
//         nextPage: videos.length === pageSize ? pageNumber + 1 : null,
//       },
//     };

//   } catch (err) {
//     console.error("Error fetching explore videos:", err);
//     return {
//       status: 500,
//       message: "Internal server error",
//       success: false,
//     };
//   }
// };
exports.getExploreVideosService = async (page, user_id) => {
  try {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = 10;
    const offset = (pageNumber - 1) * pageSize;

    // 🔹 Fetch Explore videos (same as your current working code)
    const videos = await ExploreVideo.findAll({
      attributes: [
        "id",
        "user_id",
        "story_id",
        "createdAt",
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.col("story.thumbnail"),
            Sequelize.fn("MIN", Sequelize.col("story.scenes.image_url"))
          ),
          "thumbnail",
        ],
      ],
      include: [
        {
          model: Story,
          as: "story",
          attributes: ["name", "thumbnail"],
          required: true,
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
        {
          model: StoryToVideo,
          as: "videoData",
          attributes: [
            "video_url",
            "video_path",
            "status",
            "id",
            "subtitle_tracks",
            "audio_tracks",
          ],
          required: true,
        },
      ],
      group: ["ExploreVideo.id", "story.id", "videoData.id"],
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
      subQuery: false,
    });

    if (videos.length === 0) {
      return {
        status: 404,
        message: "No videos found",
        success: false,
      };
    }

    // Format data
    let formattedVideos = formatteVideoDate(videos);

    console.log("uaer is",user_id)
    // 🔹 If user is logged in, find which videos they've reported
    if (user_id && user_id != 0) {
      console.log("test")
      const videoIds= formattedVideos.map(video=>video.id)
      
      console.log("videoids :",videoIds)

      const explore_reports= await VideoReport.findAll({
        where:{
          published_id:{
            [Op.in]:videoIds
          }
        },
      })
      // console.log("explore reports:",explore_reports)

      const reportedVideoIds=explore_reports.map(video_report=>{
        const report_details=video_report.report_details;
        // console.log("report details :",report_details)
        if(report_details){
          const user_report= report_details.find(report=>
            report.user_id==user_id
          )
          if(user_report){
            return video_report.published_id;
          }
        }
      })

      // 🔹 Mark reported videos
      formattedVideos = formattedVideos.map(video => ({
        ...video,
        isUserReported: reportedVideoIds.includes(video.id),
      }));
    }

    console.log("updated formattted data:", formattedVideos )

    return {
      status: 200,
      message: "Videos fetched successfully",
      success: true,
      videos: formattedVideos,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        nextPage: videos.length === pageSize ? pageNumber + 1 : null,
      },
    };
  } catch (err) {
    console.error("Error fetching explore videos:", err);
    return {
      status: 500,
      message: "Internal server error",
      success: false,
    };
  }
};


exports.getUserPublishedVideosService = async (user_id) => {
  try {
    const videos = await ExploreVideo.findAll({
      where: { user_id },
      attributes: [
        "id",
        "user_id",
        "story_id",
        "createdAt",
        // Get thumbnail from story or first scene
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.col("story.thumbnail"),
            Sequelize.fn("MIN", Sequelize.col("story.scenes.image_url"))
          ),
          "thumbnail"
        ],
      ],
      include: [
        {
          model: Story,
          as: "story",
          attributes: ["name", "thumbnail"],
          required: true,
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
        {
          model: StoryToVideo,
          as: "videoData",
          attributes: [["id", "story_to_video"], "video_url", "video_path", "status",'subtitle_tracks', 'audio_tracks'],
          required: true,
        },
      ],
      group: ["ExploreVideo.id", "story.id", "videoData.id"],
      order: [["createdAt", "DESC"]],
      subQuery: false,
    });
    console.log("vikdro",videos)
    // Format response
    const formattedVideos = formatteVideoDate(videos)

    return {
      success: true,
      videos: formattedVideos,
      message: "User videos fetched successfully",
      status: 200,
    };
  } catch (e) {
    console.error("Error fetching user published videos:", e);
    return {
      success: false,
      message: "Failed to fetch user videos",
      status: 500,
    };
  }
};

exports.deletePublishedVideoService = async (video_id, user_id) => {
  try {
    // Check if video exists and belongs to user
    const video = await ExploreVideo.findOne({
      where: {
        id: video_id,
        user_id: user_id,
      },
    });

    if (!video) {
      return {
        success: false,
        message: "Video not found or you don't have permission to delete it",
        status: 404,
      };
    }

    // Delete the video
    await ExploreVideo.destroy({
      where: {
        id: video_id,
        user_id: user_id,
      },
    });

    return {
      success: true,
      message: "Video deleted successfully",
      status: 200,
    };
  } catch (e) {
    console.error("Error deleting published video:", e);
    return {
      success: false,
      message: "Failed to delete video",
      status: 500,
    };
  }
};

const formatteVideoDate=(videos)=>{
  return videos.map((video) => {
      const videoJson = video.toJSON();
      return {
        id: videoJson.id,
        story_to_video_id : videoJson.videoData?.story_to_video,
        user_id: videoJson.user_id,
        story_id: videoJson.story_id,
        title: videoJson.story?.name || null,
        thumbnail: videoJson.thumbnail || null, // From aggregated COALESCE
        video_url: videoJson.videoData?.video_url || null,
        video_path: videoJson.videoData?.video_path || null,
        status: videoJson.videoData?.status || null,
        published_date: videoJson.createdAt,
        subtitle_tracks: videoJson.videoData.subtitle_tracks,
        audio_tracks:videoJson.videoData.audio_tracks
      };
    });
}