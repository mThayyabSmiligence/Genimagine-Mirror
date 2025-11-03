const { Sequelize } = require('sequelize');
const ExploreVideo = require("../models/ExploreVideo");
const StoryToVideo = require("../models/StoryToVideo");
const Story = require("../models/Story");
const Scene = require("../models/Scene");


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



exports.getExploreVideosService = async (page, user_id) => {
  try {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = 10;
    const offset = (pageNumber - 1) * pageSize;

    // Fetch videos with aggregated thumbnail from scenes
    const videos = await ExploreVideo.findAll({
      attributes: [
        "id",
        "user_id",
        "story_id",
        "createdAt",
        // Use COALESCE to get story thumbnail or first scene image
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
          attributes: ["video_url", "video_path", "status", 'id','subtitle_tracks', 'audio_tracks'],
          required: true,
        },
      ],
      group: ["ExploreVideo.id", "story.id", "videoData.id"],
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset: offset,
      subQuery: false,
    });

    if (videos.length === 0) {
      return {
        status: 404,
        message: "No videos found",
        success: false,
      };
    }

    // Format response
    const formattedVideos = formatteVideoDate(videos)
    console.log("formatted videos: ",formattedVideos)

    return {
      status: 200,
      message: "Videos fetched successfully",
      success: true,
      videos: formattedVideos,
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
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
          attributes: ["video_url", "video_path", "status",'subtitle_tracks', 'audio_tracks'],
          required: true,
        },
      ],
      group: ["ExploreVideo.id", "story.id", "videoData.id"],
      order: [["createdAt", "DESC"]],
      subQuery: false,
    });

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