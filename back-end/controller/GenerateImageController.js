const express = require('express')
const { GuestUserHandler } = require('../service/GuestUserService')
const cookie = require('cookie');
const db = require('../config/connectDatabase');
exports.generateImageApiCall = async(req, res, next) => {
    console.log("generate image is running")
    
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
            const isGenerated=generateImage(type, req.ip)
            res.status(200).json({
                message:"image si generated"
            })
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

const generateImage = (type, data) => {
    console.log('image is generated');
    if (type == "guest") {
        const guestImageCount = GuestImageCount(data);
        
    }else if(type=="user"){

        console.log('user image count is increased')
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