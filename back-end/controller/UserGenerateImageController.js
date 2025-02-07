const express = require('express')
const { GuestUserHandler } = require('../service/GuestUserService')
const cookie = require('cookie');
const db = require('../config/connectDatabase');
const axios = require('axios')
const jwt = require('jsonwebtoken');
const dotenv =require('dotenv')
const path =require('path');
const { canUserGenerateFree, increaseFreeGenerationCountForUser, handelModel, checkCreditBalance, deductCredit, createChat, StoreImageInTabel, StoreIMagePathandUrl } = require('../service/UserService');
const { freeGenerateImageService, freeGenerateImage } = require('../service/FreeGenerateImageService');
const { paidGenerateImageService } = require('../service/PaidGenerateImageService');
const { uploadImageToServer } = require('../service/UploadToServerService');


exports.userGenerateImageController=async(req,res,next)=>{
    const {prompt,model,chat_id} =req.body;
    console.log("prompt :"+prompt+"model :"+model)

    
     

    //getting jwt token from cookies
        let cookies =null
        let token =null
        let decodeToken=null
        
        try{
            const cookies1 = cookie.parse(req.headers.cookie)
            cookies=cookies1    
            const token1 = cookies.token
            token= token1
            decodeToken= jwt.decode(token)
        }catch(err){
            console.log(err)
        }

    
    const {id,username,role}= decodeToken

    console.log(id)
    console.log(username) 
    console.log(role)

    
        
    if(model==1 || model==null){
        const canUserGenerateForFree= await canUserGenerateFree(decodeToken.id)
        
        //exiting if the limit exceeded
        if(!canUserGenerateForFree){
            res.status(429).json({
                message:"free image generation limit exceeded"
            })
            return
        }
        const inputs={
            prompt:prompt
        }

        const image =await freeGenerateImage(inputs)
        if(!image){
            res.status(429).json({
                message:"somthing went worng with image generation"
            })
            return
        }
        await increaseFreeGenerationCountForUser(id)
        
        let chatId= null
        if(chat_id==null){
            const newChatId= await createChat(id);
            const insertedImage = 0;
            chatId=newChatId
        }else{
            chatId=chat_id
        }
        const generated_image_data={
            user_id:id,
            prompt:prompt,
            model:model!=null?model:1,
            chat_id:chatId,
            image_url:"storage is not defined"
        }

        const insertImage = await StoreImageInTabel(generated_image_data)
        const image_id= insertImage.insertId

        console.log(insertImage.insertId)
        console.log(Buffer.isBuffer(image)?"true ":"false")

        //image,userId,chatId,imageId,isChat,isExplore,isLibrary,token

        const imageUpload = await uploadImageToServer(image,id.toString(),chatId.toString(),image_id.toString(),'chat',token,req)
        
        
        const s_p_u=await StoreIMagePathandUrl(image_id,imageUpload.imagePath,imageUpload.imageUrl)

        res.status(200)
                .set('Content-Type', 'image/png') // Ensure the image MIME type is set
                .send(image);

        return
    }else{
        const inputs ={
            prompt:prompt
        }
        const model_data=handelModel(model)
        console.log(model_data)

        const enoughCredits =await  checkCreditBalance(id,model_data.cp_required)

        if(!enoughCredits){
            res.status(402).json({
                message:"not enough credits"
            })
            return
        }

        const image=await paidGenerateImageService(inputs,model_data.model_url)


        if(!image){
            res.status(429).json({
                message:"somthing went worng with paid image generation"
            })
            return
        }

        await deductCredit(id,model_data.cp_required) ;
        let chatId= null
        if(chat_id==null){
            const newChatId= await createChat(id);
            const insertedImage = 0;
            chatId=newChatId
        }else{
            chatId=chat_id
        }
        const generated_image_data={
            user_id:id,
            prompt:prompt,
            model:model!=null?model:1,
            chat_id:chatId,
            image_url:"storage is not defined"
        }

        const insertImage = await StoreImageInTabel(generated_image_data)

        res.status(200)
                .set('Content-Type', 'image/png') // Ensure the image MIME type is set
                .send(image);
        return

    }
}