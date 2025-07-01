const express = require('express')
const { GuestUserHandler } = require('../service/GuestUserService')
const db = require('../config/connectDatabase');
const { freeGenerateImage } = require('../service/FreeGenerateImageService');
 
exports.guestGenerateImageController = async(req, res, next) => {
    const {prompt,client_ip}=req.body
    const input={
         prompt:prompt||"cat",
         width:480,
         height:480
    }
    const canGenerate=await GuestUserHandler(client_ip);
            console.log(canGenerate)
            if(canGenerate){
                const isGenerated=await freeGenerateImage(input)
                if(isGenerated){
                    const guestImageCount = increaseGuestImageCount(client_ip); 
                    res.status(200).json({
                        image: `data:image/png;base64,${isGenerated.toString('base64')}`,
                        message: 'Image generated successfully',
                        
                      });
                }else{
                    res.status(429).json({
                        message:"something went worng with server"
                    })
                }                
            }else{
                console.log("daily limit exceeded")
                res.status(429).json({
                    message: "You Reached Today's limit, login to generate more free images or try tomorrow"
                })
            }
}

    
const increaseGuestImageCount = async (ipAddress) => {
    try {
        const [rows] = await db.execute(
            'SELECT id FROM guest_image_limits WHERE ip_address = ?',
            [ipAddress]
        );
    
        if (rows.length === 0) {
            throw new Error(`No user found with IP address: ${ipAddress}`);
        }
        const userId = rows[0].id; 
            const query = `
            UPDATE guest_image_limits 
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