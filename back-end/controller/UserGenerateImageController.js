const express = require('express')
const { GuestUserHandler } = require('../service/GuestUserService')
const cookie = require('cookie');
const db = require('../config/connectDatabase');
const axios = require('axios')
const jwt = require('jsonwebtoken');
const dotenv =require('dotenv')
const path =require('path');
const { canUserGenerateFree, increaseFreeGenerationCountForUser, handelModel, checkCreditBalance, deductCredit, createChat, StoreImageInTabel, StoreIMagePathandUrl, handelAspectRatio, getCreditByUserId, updateChatUpdatedAt, promptModerationCheck } = require('../service/UserService');
const { freeGenerateImageService, freeGenerateImage } = require('../service/FreeGenerateImageService');
const { paidGenerateImageService } = require('../service/PaidGenerateImageService');
const { uploadImageToServer } = require('../service/UploadToServerService');
const { encrypt } = require('../service/EncrypDecrypt');
const { decrypt } = require('../service/EncrypDecrypt');
const { generateImageWithStability } = require('../service/generateSDImage');
const { getStyleNameById } = require('./UsersController');


exports.userGenerateImageController=async(req,res,next)=>{
    const {prompt,model,chat_id,aspect_ratio,quality,style} =req.body;
    console.log(aspect_ratio)
    console.log("body",req.body)
    console.log("prompt :"+prompt+"model :"+model)

    // const flagged =await promptModerationCheck(prompt)
    // if(flagged){
    //     res.status(403).json({message: "This prompt has been flagged for moderation"})
    //     return
    // }

    const w_h = await handelAspectRatio(quality,aspect_ratio)
    console.log("w_h 1232",w_h)

    // getting jwt token from cookies
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
    console.log("style :",style)

    let updatedPrompt = prompt;
    if (style && style != 0) {
        const styleName = await getStyleNameById(style);
        if (styleName) {
        updatedPrompt += ` in style of ${styleName}`;
        }
    }

    // encrypt
    const encryptedPrompt = encrypt(prompt);
    console.log("Encrypted Prompt: ", encryptedPrompt)
        
    if(model==1 || model==null){
        const canUserGenerateForFree= await canUserGenerateFree(decodeToken.id)
        
        //exiting if the limit exceeded
        if(!canUserGenerateForFree.success){
            res.status(canUserGenerateForFree.status).json(canUserGenerateForFree)
            return
        }
        
        const inputs={
            prompt:updatedPrompt,
            negative_prompt:"skull",
            width:w_h.width,
            height:w_h.height,
            style:style
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
            const newChatId= await createChat(id,prompt);
            const insertedImage = 0;
            chatId=newChatId
        }else{
            chatId=chat_id
            const result = await updateChatUpdatedAt(chatId)
        }
        
        const generated_image_data={
            user_id:id,
            prompt:encryptedPrompt,
            model:model!=null?model:1,
            chat_id:chatId, 
            image_url:"storage is not defined",
            aspect_ratio:aspect_ratio,
            quality:quality,
            resolution:`${w_h.width}*${w_h.height}`,
            style:style==0?"none":styleList[style-1].style_name
        }
        const insertImage = await StoreImageInTabel(generated_image_data)
        const image_id= insertImage.insertId

        //image,userId,chatId,imageId,isChat,isExplore,isLibrary,token

        const imageUpload = await uploadImageToServer(image,id.toString(),chatId.toString(),image_id.toString(),'chat',token,req)

        if(!imageUpload.success){
            res.status(500).json(imageUpload)
            return
        }

        console.log(imageUpload);
        
        const s_p_u=await StoreIMagePathandUrl(image_id,imageUpload.imagePath,imageUpload.imageUrl)

        res.status(200).json({
            image_id: image_id,
            user_id: id,
            chat_id:chatId,
            image_url: imageUpload.imageUrl,
            model:1,
            prompt:prompt,
            aspect_ratio:aspect_ratio,
            quality:quality,
            resolution:`${w_h.width}*${w_h.height}`
          });

        return
    }else{
        const inputs={
            prompt:updatedPrompt,
            negative_prompt:"skull",
            width:w_h.width,
            height:w_h.height,
            style:style
        }
        const model_data=await handelModel(model, aspect_ratio, quality)

        if (!model_data.success) {
            res.status(model_data.status).json({ message: model_data.message });
            return;
        }
    // yesterday  change 

        const enoughCredits =await checkCreditBalance(id,model_data.cp_required)

        if(!enoughCredits){
            res.status(402).json({
                message:"not enough credits"
            })
            return
        }
    
        // today change 20/5/2025
        // const image=await paidGenerateImageService(inputs,model_data.model_url)

        let image;

        if (model_data.model_type === "stability") {
            // image = await generateSDImage(inputs); // Stability AI
            image = await generateImageWithStability(inputs); 
        } else {
            image = await paidGenerateImageService(inputs, model_data.model_url); // Cloudflare
        }

        if(!image){
            res.status(429).json({
                message:"somthing went worng with paid image generation"
            })
            return
        }

    // yesterday  change

        const remaining = await deductCredit(id,model_data.cp_required) ;

        let chatId= null
        if(chat_id==null){
            const newChatId= await createChat(id,prompt);
            const insertedImage = 0;
            chatId=newChatId
        }else{ 
            chatId=chat_id
            const result = await updateChatUpdatedAt(chatId)
        }
        
        const generated_image_data={
            user_id:id,
            prompt:encryptedPrompt,
            model:model!=null?model:1,
            chat_id:chatId,
            image_url:"storage is not defined",
            aspect_ratio:aspect_ratio,
            quality:quality,
            resolution:`${w_h.width}*${w_h.height}`,
            style:style==0?"none":styleList[style-1].style_name
        }

        const insertImage = await StoreImageInTabel(generated_image_data)
        const image_id= insertImage.insertId;

        const imageUpload = await uploadImageToServer(image,id.toString(),chatId.toString(),image_id.toString(),'chat',token,req)

        if(!imageUpload.success){
            res.status(500).json(imageUpload)
            return
        }

        console.log(imageUpload)
        
        
        const s_p_u=await StoreIMagePathandUrl(image_id,imageUpload.imagePath,imageUpload.imageUrl)

        // const credits=await getCreditByUserId(id)
        
        res.status(200).json({
            image_id: image_id,
            user_id: id,
            chat_id:chatId,
            image_url: imageUpload.imageUrl,
            model:1,
            prompt:prompt,
            aspect_ratio:aspect_ratio,
            quality:quality,
            resolution:`${w_h.width}*${w_h.height}`,
            // credits:credits[0].credits,
            credits_remaining: remaining
          });
        return

    }
}