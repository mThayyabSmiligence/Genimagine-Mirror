const axios = require('axios');
const multer = require('multer');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

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

exports.deleteFromServer=async(filePath,userId,chatId,imageId)=>{
  try {
    // Delete file from S3
    const params = {
      Bucket: process.env.AWS_BUCKET, // Your S3 bucket name
      Key: filePath, // File name
    };
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
    return {status:200, success:true,message:"file is deleted"}
  } catch (err) {
    console.error('Error deleting file:', err);
    return {status:500,success:false,message:"error deleting file from amazon s3",error:err}
  }
}

exports.deleteChatFromServer=async(userId,chatId)=>{

  try{
    const listCommand= new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET,
      Prefix: `chat/${userId}/${chatId}/`
    })
    console.log('list command', listCommand)
    const data = await s3.send(listCommand)
    console.log('data of contents', data)
    if(!data.Contents||data.Contents.length === 0){
      // return {
      //   status:404,
      //   success:false,
      //   message:"chat folder is empty"
      // }
       console.log("No files to delete in S3 — continuing.");
      return {
        status:200,
        success:true,
        message:"chat folder is empty, nothing to delete"
      }
    }

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: process.env.AWS_BUCKET,
      Delete: {
        Objects: data.Contents.map(obj => ({Key: obj.Key })),
      },
    })

    await s3.send(deleteCommand)
    return {
      status:200,
      success:true,
      message:"chat folder is deleted"
    }

  }catch(err){
    console.error('Error deleting chat', err);
    return {
      status:500,
      success:false,
      message:"error deleting chat from amazon s3",
      error:err
    }
  }
}