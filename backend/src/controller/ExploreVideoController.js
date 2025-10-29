const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const { publishVideoToExplore, getExploreVideosService, getUserPublishedVideosService, deletePublishedVideoService } = require("../service/ExploreVideoService");

exports.publishVideoToExploreController = async (req, res) => {
  try {
    const { story_id } = req.body;
    if (!story_id) {
      return res.status(400).json({
        success: false,
        message: "story_id is required",
        status: 400,
        frontendMessage: "Story ID is required",
      });
    }

    const result = await publishVideoToExplore({
      story_id,
      user_id: req.user.id,
    });

    res.status(result.status).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to publish video",
    });
  }
};


exports.getAllExploreVideosController = async (req, res) => {
  try {
    const { page } = req.query;

    let cookies = null;
    let token = null;
    let decodeToken = null;
    let userId = 0;

    try {
      const cookies1 = cookie.parse(req.headers.cookie);
      cookies = cookies1;
      const token1 = cookies.token;
      token = token1;
      decodeToken = jwt.decode(token);
      userId = decodeToken.id;
    } catch (err) {
      // User not logged in
    }

    const response = await getExploreVideosService(page, userId);

    res.status(response.status).json(response);
  } catch (err) {
    console.error("Error in explore videos API:", err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.getUserPublishedVideosController = async(req, res) => {
  try {
    const user_id = req.user.id; 

    const result = await getUserPublishedVideosService(user_id);

    res.status(result.status).json(result);
  } catch (e) {
    console.error("Error in getUserPublishedVideosController:", e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user videos",
    });
  }
}

exports.deletePublishedVideoController = async (req, res) => {
  try {
    const { video_id } = req.params;
    const user_id = req.user.id; // From auth middleware

    if (!video_id) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required",
      });
    }

    const result = await deletePublishedVideoService(video_id, user_id);

    res.status(result.status).json(result);
  } catch (e) {
    console.error("Error in deletePublishedVideoController:", e);
    res.status(500).json({
      success: false,
      message: "Failed to delete video",
    });
  }
};