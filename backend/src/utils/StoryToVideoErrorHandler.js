// utils/StoryToVideoErrorHandler.js
const StoryToVideoError = require("./StoryToVideoError");
const { StoryToVideo } = require("../models");

/**
 * Wrapper function for background workers that handles errors
 * and updates database status automatically
 */
const withStoryToVideoErrorHandler = (workerFn) => {
    return async (...args) => {
        let storyToVideoId = null;
        
        try {
            return await workerFn(...args);
        } catch (error) {
            console.error("🔥 Worker Error:", error);

            // Try to extract storyToVideoId from error or args
            if (error instanceof StoryToVideoError) {
                storyToVideoId = error.storyToVideoId;
                await error.updateJobStatus();
            } else if (args[0]) {
                // Assume first argument is storyToVideoId
                storyToVideoId = args[0];
                try {
                    const storyToVideo = await StoryToVideo.findByPk(storyToVideoId);
                    if (storyToVideo) {
                        storyToVideo.status = "failed";
                        storyToVideo.error_message = error.message || "Unknown error occurred";
                        await storyToVideo.save();
                        console.error(`❌ Job ${storyToVideoId} marked as failed`);
                    }
                } catch (dbError) {
                    console.error("Failed to update job status:", dbError);
                }
            }

            // Rethrow for logging/monitoring systems
            throw error;
        }
    };
};

module.exports = { withStoryToVideoErrorHandler, StoryToVideoError };
