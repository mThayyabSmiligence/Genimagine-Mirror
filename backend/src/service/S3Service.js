require("dotenv").config({ path: require("path").resolve(__dirname, "../config.env") });
const { uploadFile, deleteFile } = require("../API/S3.api")
const crypto = require('crypto');
const AppError = require("../utils/AppError");
const StoryToVideoError = require("../utils/StoryToVideoError");
const algorithm = 'aes-128-cbc';
const secretKey = process.env.SECRET_KEY || 'secretkey123';
const iv = Buffer.from(process.env.IV || '1234567890123456', 'hex');

const fs = require('fs');

const s3AiLearningBasePath = process.env.S3_AI_LEARNING_BASE_PATH;

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

exports.uploadPdf = async(file , path)=>{
    const upload = await uploadFile(file,path,"application/pdf");
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

exports.uploadAiLearningPdf = async(file,user_id,spec_id)=>{

    const path = s3AiLearningBasePath+"/orginal-pdf/"+encryptId(user_id.toString())+"/"+encryptId(spec_id.toString());
    const buffer = file.buffer;
    const upload = await this.uploadPdf(buffer,path);
    return upload
}

exports.uploadAiLearningSlideImage = async(filePath,user_id,spec_id,module_id,objective_id,index)=>{
    try{
        const buffer = await fs.promises.readFile(filePath);

        const path = `${s3AiLearningBasePath}/slides/${encryptId(user_id.toString())}/${encryptId(spec_id.toString())}/${encryptId(module_id.toString())}_${encryptId(objective_id.toString())}_${index}.png`;
        const upload = await this.uploadImage(buffer,path);
        if(upload.success === false){
            throw new AppError(upload.message || "Slide image upload failed", 500)
        }

        // clean up local temp file best-effort
        fs.promises.unlink(filePath).catch(() => {});

        return {
            ...upload,
            path
        }
    }
    catch(err){
        throw new AppError(err.message||"Something went wrong with uploading ai learning slide image", 500)
    }

}

/**
 * Delete a single S3 file. Accepts a key or full URL and normalizes to the key.
 * @param {string} filePath
 */
exports.deleteS3File = async (filePath) => {
    if (!filePath) {
        return { success: false, message: "Invalid file path", path: filePath };
    }

    let key = filePath;
    if (/^https?:\/\//i.test(filePath)) {
        try {
            const url = new URL(filePath);
            key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
        } catch (err) {
            return { success: false, message: "Invalid file URL", path: filePath };
        }
    }

    const result = await deleteFile(key);
    return { ...result, path: key };

};


