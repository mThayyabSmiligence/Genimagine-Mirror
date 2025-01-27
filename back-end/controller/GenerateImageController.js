const express = require('express')
const { GuestUserHandler } = require('../service/GuestUserService')
const cookie = require('cookie');
const db = require('../config/connectDatabase');
const axios = require('axios')
exports.generateImageApiCall = async(req, res, next) => {
    const {prompt}=req.body
    console.log("generate image is running")
    const input={
         prompt:prompt||"cat"
    }
    
    // console.log(req.headers.cookie)
    const cookies = cookie.parse(req.headers.cookie||"")
    // console.log(cookies)
    const token = cookies.token
    let type=""
    if(!token) {
        type="guest"
        const canGenerate=await GuestUserHandler(req.ip);
        console.log(canGenerate)
        if(canGenerate){
            const isGenerated=await generateImage(type, req.ip,input)
            if(isGenerated){
                res.status(200)
                .set('Content-Type', 'image/png') // Ensure the image MIME type is set
                .send(isGenerated);
            }else{
                res.status(429).json({
                    message:"something went worng with server"
                })
            }
            
        }else{

            console.log("daily limit exceeded")
            res.status(429).json({
                message: "You Reached Today's limit, Try Tomorrow"
            })
        }
    } else {
        type="user"
        console.log(token);
    }

} 

const generateImage = async(type, data,inputs) => {
    try{

        const response = await axios.post(
            'https://api.cloudflare.com/client/v4/accounts/81d90c9d5df5eef4295c5d4529e5bfa4/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0',
            inputs,
            {
              headers: {
                'Authorization': `Bearer danQcMub1AoOvmYBEuL5SwNUgQ0gPIXbPhGGtPww`,
                'Content-Type': 'application/json',
              },
              responseType: 'arraybuffer',
            }
        );

        const imageBuffer= Buffer(response.data,'base64')
        if (type == "guest") {
            const guestImageCount = GuestImageCount(data);     
        }else if(type=="user"){
        
            console.log('user image count is increased')
        }
        return imageBuffer
    }catch(error){
        console.log("error generating images:" +error)
        return false;
    }
}

const GuestImageCount = async (ipAddress) => {
    try {
        const [rows] = await db.execute(
            'SELECT id FROM Guest_Image_Limits WHERE ip_address = ?',
            [ipAddress]
        );
    
        if (rows.length === 0) {
            throw new Error(`No user found with IP address: ${ipAddress}`);
        }
        const userId = rows[0].id; 
            const query = `
            UPDATE Guest_Image_Limits 
            SET image_count = image_count + 1, updated_at = NOW()
            WHERE id = ?;
        `;
        const [result] = await db.execute(query, [userId]);
        console.log('Image count updated successfully');
        return result;
    } catch (err) {
        console.error('Error incrementing image count:', err.message);
        throw err;
    }
};