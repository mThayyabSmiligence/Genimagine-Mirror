const db = require('../config/connectDatabase');
const dotenv =require('dotenv');
const path =require('path');
const { customAlphabet } = require("nanoid");
const { ImageToPromptApi } = require('../API/ImageToPrompt.api');
const { uploadImageToServer } = require('./UploadToServerService');

dotenv.config({path: path.join(__dirname, 'config', 'config.env')})

const cloud_flare_acc_id= process.env.CLOUD_FLARE_ACC_ID
const cloud_flare_api_key=process.env.CLOUD_FLARE_API_KEY

exports.imageToPromptService = async (imageArray,user_id) => {
    try {

        const result = await ImageToPromptApi(imageArray);
        if(!result.success){
            return {
                prompt:"something went wrong",
                status:500,
                success:false
            };
        }
        if(user_id){
            const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6); // 6-char random string
            const image_id= nanoid();
 
            const imgUrl= await uploadImageToServer(imageArray,user_id,null,image_id,"image_to_prompt");
            if (!imgUrl || !imgUrl.imagePath) {
                console.error("Image upload failed - no image path returned");
                throw new Error("Image upload failed - no image path returned");
            }
            const query = "insert into image_to_prompt (id,image_url,user_id,prompt) values(?,?,?,?) "
            const  [row]= await db.execute(query,[image_id,imgUrl.imageUrl,user_id,result.prompt]);
            console.log(row);
            return {
                prompt:result.prompt,
                image_id:image_id,
                image_url:imgUrl.imageUrl,
                user_id:user_id,
                status:200,
                success:true
            };
        }

        return {
            prompt:result.prompt,
            status:200,
            success:true
        };
    }
    catch(err){
        console.log(err)
        return {
            prompt:err,
            status:500,
            success:false
        };
    }
}

exports.getImageToPromptConversationHistoryService=async(user_id,page,sort)=>{
    try{
        let query = "SELECT * FROM image_to_prompt WHERE user_id=? "
        const limit = 2;
        const offset = (page - 1) * limit;

        if (sort === "asc") {
            query += `ORDER BY created_at ASC LIMIT ${limit} OFFSET ${offset}`;
        } else if (sort === "desc") {
            query += `ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        }

        const [rows] = await db.execute(query,[user_id]);

        

        return {
            images:rows,
            status:200,
            success:true,
            message:"success",
            pagination: {
                currentPage: page,
                pageSize: limit, // 🔹 Always fixed
                nextPage: rows.length === limit ? page + 1 : null,
            },
        }
    }catch(err){
        console.log(err)
        return {
            data:err,
            status:500,
            success:false
        }
    }
}