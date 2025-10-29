const { uploadFile } = require("../API/S3.api")
const crypto = require('crypto');
const AppError = require("../utils/AppError");
const StoryToVideoError = require("../utils/StoryToVideoError");
const algorithm = 'aes-128-cbc';
const secretKey = process.env.SECRET_KEY || 'secretkey123';
const iv = Buffer.from(process.env.IV || '1234567890123456', 'hex');

const fs = require('fs');


function encryptId(id) {
  return crypto.createHash('sha256').update(id.toString()).digest('hex').slice(0, 16);
}

// function encrypt(data) {
//     try {
//         const algorithm = 'aes-256-cbc'; // or your preferred algorithm
//         const key = crypto.randomBytes(32); // 32 bytes for AES-256
//         const iv = crypto.randomBytes(16); // 16 bytes for CBC mode
        
//         const cipher = crypto.createCipheriv(algorithm, key, iv);
//         let encrypted = cipher.update(data, 'utf8', 'hex');
//         encrypted += cipher.final('hex');
        
//         return {
//             encrypted,
//             key: key.toString('hex'),
//             iv: iv.toString('hex')
//         };
//     } catch (error) {
//         console.error('Encryption error:', error);
//         throw error;
//     }
// }

exports.uploadImage = async(image , path)=>{
    const upload = await uploadFile(image,path,"image/png");
    return upload
}

exports.uploadVideo = async(image , path)=>{
    const upload = await uploadFile(image,path,"video/mp4");
    return upload
}


exports.uploadAudio = async(image , path)=>{
    const upload = await uploadFile(image,path,"audio/mpeg");
    return upload
}

exports.uploadStoryToVideo = async(video,story_id,video_id)=>{

    const path = "/storyToVideo/"+encryptId(story_id.toString())+"/"+encryptId(video_id.toString());
    const upload = await this.uploadVideo(video,path);
    return {
        ...upload,
        path
    }
}

// Fixed uploadSubtitles function for SRT files
exports.uploadSubtitles = async (srtPath, storyToVideoId, language) => {
  const pathKey = `storyToVideo/${encryptId(storyToVideoId.toString())}/sub/${language}.srt`;
  
  // Read as UTF-8 text, not a raw buffer
  const srtContent = fs.readFileSync(srtPath);

  // Upload with correct MIME type and charset
  const upload = await uploadFile(Buffer.from(srtContent), pathKey, "text/plain;");

  if (!upload.success) {
    console.error(`Failed to upload ${language}:`, upload.message);
    return { ...upload, success: false };
  }

  return {
    ...upload,
    path: pathKey,
    success: true,
  };
};

/**
 * Upload audio track for a specific language
 * @param {Buffer} audio - Audio file buffer
 * @param {Number} storyId - Story ID
 * @param {Number} videoId - StoryToVideo ID
 * @param {String} language - Language code (e.g., 'en', 'es', 'hi')
 * @returns {Object} Upload result with fileUrl and path
 */
exports.uploadAudioTrack = async (audio,storyToVideoId, language) => {
    try {
        // Create path with encrypted IDs and language identifier
        const encryptedStoryToVideoId = encryptId(storyToVideoId.toString());
        
        const path = `storyToVideo/${encryptedStoryToVideoId}/audio/${language}.mp3`;
        
        // Upload audio file
        const upload = await this.uploadAudio(audio, path);
        
        if (!upload.success) {
            throw new StoryToVideoError(
                `Failed to upload audio track for language: ${language}`, 
                500, 
                storyToVideoId
            );
        }
        
        return {
            ...upload,
            path,
            language,
            success: true
        };
    } catch (error) {
        console.error(`❌ Error uploading audio track for ${language}:`, error);
        throw new StoryToVideoError(
            error.message || 'Failed to upload audio track', 
            500, 
            videoId
        );
    }
};
