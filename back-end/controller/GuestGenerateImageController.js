const express = require('express')
const { GuestUserHandler } = require('../service/GuestUserService')
const db = require('../config/connectDatabase');
const { freeGenerateImage } = require('../service/FreeGenerateImageService');
 
exports.guestGenerateImageController = async(req, res, next) => {
    const {prompt}=req.body
    console.log("generate image is running") 
    const input={
         prompt:prompt||"cat"
    }
    const canGenerate=await GuestUserHandler(req.ip);
            console.log(canGenerate)
            if(canGenerate){
                const isGenerated=await freeGenerateImage(input)
                if(isGenerated){
                    const guestImageCount = increaseGuestImageCount(req.ip); 
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
}

    
const increaseGuestImageCount = async (ipAddress) => {
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