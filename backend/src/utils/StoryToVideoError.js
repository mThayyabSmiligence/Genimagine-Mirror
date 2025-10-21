// utils/StoryToVideoError.js
const { StoryToVideo } = require("../models");

class StoryToVideoError extends Error {
    constructor(message, statusCode, storyToVideoId = null) {
        super(message);
        this.statusCode = statusCode;
        this.storyToVideoId = storyToVideoId;
        Error.captureStackTrace(this, this.constructor);
    }

    async updateJobStatus() {
        if (!this.storyToVideoId) return;
        
        try {
            const storyToVideo = await StoryToVideo.findByPk(this.storyToVideoId);
            if (storyToVideo) {
                storyToVideo.status = "failed";
                storyToVideo.error_message = this.message;
                await storyToVideo.save();
                console.error(`❌ Job ${this.storyToVideoId} marked as failed: ${this.message}`);
            }
        } catch (dbError) {
            console.error("Failed to update job status:", dbError);
        }
    }
}

module.exports = StoryToVideoError;
