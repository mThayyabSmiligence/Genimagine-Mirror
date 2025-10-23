const { uploadFile } = require("../API/S3.api")
const crypto = require('crypto');
const AppError = require("../utils/AppError");
const StoryToVideoError = require("../utils/StoryToVideoError");
const algorithm = 'aes-128-cbc';
const secretKey = process.env.SECRET_KEY || 'secretkey123';
const iv = Buffer.from(process.env.IV || '1234567890123456', 'hex');

const fs = require('fs');
function encrypt(data) {
    try {
        const algorithm = 'aes-256-cbc'; // or your preferred algorithm
        const key = crypto.randomBytes(32); // 32 bytes for AES-256
        const iv = crypto.randomBytes(16); // 16 bytes for CBC mode
        
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            encrypted,
            key: key.toString('hex'),
            iv: iv.toString('hex')
        };
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
}

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

    const path = "/storyToVideo/"+encrypt(story_id.toString()).encrypted+"/"+encrypt(video_id.toString()).encrypted;
    const upload = await this.uploadVideo(video,path);
    return {
        ...upload,
        path
    }
}

// Fixed uploadSubtitles function for SRT files
exports.uploadSubtitles = async (subtitles, storyToVideoId) => {
    const uploadedSubtitles = [];
    
    for (const subtitle of subtitles) {
        // Add .srt extension to the path
        const path = `/storyToVideo/${encrypt(storyToVideoId.toString()).encrypted}/${subtitle.language}.srt`;
        
        // Read file as buffer
        const fileBuffer = fs.readFileSync(subtitle.localPath);
        
        // Upload with correct MIME type for SRT
        const upload = await uploadFile(fileBuffer, path, "application/x-subrip");

        if (!upload.success) {
            console.error(`Failed to upload ${subtitle.language}:`, upload.message);
            continue;
        }

        uploadedSubtitles.push({
            language: subtitle.language,
            Label: subtitle.Label, // Fixed typo
            path: path,
            url: upload.fileUrl
        });
    }
    
    return uploadedSubtitles;
};