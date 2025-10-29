require("dotenv").config({ path: require("path").resolve(__dirname, "../config.env") });

const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});
  


const uploadFile = async (file, path, type ) => {
    try{
        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: path,
             Body:file,
            ContentType: type,
        };

        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
        const fileUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${params.Key}`;
        return {
            success: true,
            fileUrl
        }
    }catch(err){
        console.log(err)
        return {
            success: false,
            message: err.message
        }
    }
};

const deleteFile = async (path) => {
    try{
        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: path,
        };

        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        return {
            success: true,
            message: "file deleted"
        }
    }catch(err){
        console.log(err)
        return {
            success: false,
            message: err.message
        }
    }
};

module.exports = {
    uploadFile,
    deleteFile
}