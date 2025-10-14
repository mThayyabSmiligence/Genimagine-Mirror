const { uploadFile } = require("../API/S3.api")
const crypto = require('crypto');
const algorithm = 'aes-128-cbc';
const secretKey = process.env.SECRET_KEY || 'secretkey123';
const iv = Buffer.from(process.env.IV || '1234567890123456', 'hex');

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = cipher.update(text, 'utf8', 'hex');
    return encrypted + iv.toString('hex').slice(2);
};

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

    const path = "/storyToVideo/"+encrypt(story_id)+"/"+encrypt(video_id);
    const upload = await this.uploadVideo(video,path);
    return upload
}