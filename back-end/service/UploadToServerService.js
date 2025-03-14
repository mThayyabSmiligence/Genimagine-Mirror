const axios = require('axios');
const multer = require('multer');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const serverStorageBaseUrl= process.env.STORAGE_SERVER_BASE_URL

const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });
  

exports.uploadImageToServer = async (image, userId, chatId, imageId, type, token,req) => {
    if (!image) {
        return res.status(400).send('No file uploaded.');
    }
    const extname ='.png';

    const imageBuffer = Buffer.from(image)
    
    const fileName = `${imageId}${extname}`;
    const folderPath = `${type}/${userId}/${chatId}`;
    const filePath = `${folderPath}/${fileName}`; 

      try {
        // S3 upload parameters (without ACL)
        const params = {
          Bucket: process.env.AWS_BUCKET, // Your S3 bucket name
          Key: filePath, // Unique file name
          Body: imageBuffer, // File content (from memory)
          ContentType: 'image/png', // MIME type of the file
        };
    
        // Upload file to S3
        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
    
        // Return the file URL from S3
        const fileUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${params.Key}`;
        return {success:true,message:"file is uploaded",imagePath:filePath,imageUrl:fileUrl}
      } catch (err) {
        console.error('Error uploading file:', err);
        return {success:false,message:"error uploading file",error:err}
      }
};

