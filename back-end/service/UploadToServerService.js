const axios = require('axios');
const FormData = require('form-data');

exports.uploadImageToServer = async (image, userId, chatId, imageId, type, token,req) => {
    const formData = new FormData();
    console.log(Buffer.isBuffer(image)?"true ":"false")

    // Append image as a Buffer with a filename
    // Append image as a Buffer with metadata for filename
    formData.append('image', image, `${imageId}.png`);
    // Append other form fields
    formData.append('userId', userId);
    formData.append('chatId', chatId);
    formData.append('imageId', imageId);
    formData.append('type', type);

    console.log(`Image Buffer?: ${Buffer.isBuffer(image)}`);
    console.log(`userId: ${typeof userId}, chatId: ${typeof chatId}, imageId: ${typeof imageId}, type: ${typeof type}`);

    try {
        const response = await axios.post(
            "http://localhost:3002/upload",formData,
           
            {
                headers: {
                    ...FormData.getHeaders, // Include FormData-specific headers
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("Response from imageUpload API:", response.data);
        return response.data;

    } catch (err) {
        console.error("Error from imageUpload API:", err.response?.data || err.message);
    }
};

exports.uploadImageToExplore=async (user_id,image_path,token)=>{
    try {
        const response = await axios.post(
            "http://localhost:3002/publish-to-explore",{
                userId:user_id,
                imagePath:image_path
            },
           
            {
                headers: {// Include FormData-specific headers
                    Authorization: `Bearer ${token}`,
                },
            }
        );
 
        console.log("Response from imageUpload API:", response.data);
        return response.data;

    } catch (err) {
        console.error("Error from imageUpload API:", err.response?.data || err.message);
        return{
            status:false,
            message:"error uploading image to explore deom UploadToServerService",
            status:500
        }
    }
}