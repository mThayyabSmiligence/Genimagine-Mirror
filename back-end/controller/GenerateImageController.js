const express = require('express')
const { GuestUserHandler } = require('../service/GuestUserService')
const cookie = require('cookie');
const db = require('../config/connectDatabase');
const axios = require('axios')
const jwt = require('jsonwebtoken');
const dotenv =require('dotenv')
const path =require('path');
const {  handleGenerateImageUser, canUserGenerateFree } = require('../service/GenerateImageService');
dotenv.config({path: path.join(__dirname, 'config', 'config.env')})


const cloud_flare_acc_id= process.env.CLOUD_FLARE_ACC_ID
const cloud_flare_api_key=process.env.CLOUD_FLARE_API_KEY


exports.generateImageApiCall = async(req, res, next) => {
    const {prompt,model}=req.body
    console.log(model)
    console.log("generate image is running")
    const input={
         prompt:prompt||"cat"
    }
    
    // console.log(req.headers.cookie)
    const cookies = cookie.parse(req.headers.cookie)
    console.log(req.headers)
    const token = cookies.token

    let type=""
    if(!token) {
        type="guest" 
        const canGenerate=await GuestUserHandler(req.ip);
        console.log(canGenerate)
        if(canGenerate){
            const isGenerated=await generateImageGuest(type, req.ip,input)
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

        const isTokenValid = verifyToken(token)

        if(isTokenValid){

            const decodedtoken= jwt.decode(token)

            const canGenerate =await canUserGenerateFree(decodedtoken.id)
            console.log(decodedtoken)
            console.log(canGenerate)
            if(!canGenerate){
                    console.log("daily limit exceeded")
                res.status(429).json({
                    message: "You Reached Today's limit, Try Tomorrow"
                })
                return
            }

            const image = await handleGenerateImageUser(req.body,token)

            if(!image){
                res.status(500).json({message:"something went wronng with generating image"})
                return
            }
             res.status(200)
                .set('Content-Type', 'image/png') // Ensure the image MIME type is set
                .send(image);
                return
        }
        else{
            res.status(401).json({
                message:"token invalid" 
            })
        }
    }

} 

const generateImageGuest = async(type, data,inputs) => {
    try{

        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`,
            inputs,
            {
              headers: {
                'Authorization': `Bearer ${cloud_flare_api_key}`,
                'Content-Type': 'application/json',
              },
              responseType: 'arraybuffer',
              
            }
        );
        // console.log(response.data.result.image)
        // const decodedString= atob(response.data.result.image)
        // const imageBuffer = Uint8Array.from(decodedString,(m)=>m.codePointAt(0))
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

const verifyToken = (jwtToken)=> {

    if (!jwtToken) return false;

    const secretKey = process.env.JWT_SECRET_KEY;
    try {
        const verified = jwt.verify(jwtToken, secretKey);
        
        return true;
    } catch (err) {
        
        return false
    }
}; 