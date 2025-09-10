const express = require('express')
const { GuestUserHandler } = require('../service/GuestUserService')
const cookie = require('cookie');
const db = require('../config/connectDatabase');
const axios = require('axios')
const jwt = require('jsonwebtoken');
const dotenv =require('dotenv')
const path =require('path');
const { canUserGenerateFree, increaseFreeGenerationCountForUser, handelModel, checkCreditBalance, deductCredit, createChat, StoreImageInTabel, StoreIMagePathandUrl, handelAspectRatio, getCreditByUserId, updateChatUpdatedAt, promptModerationCheck, generateContextPrompt, generateCrossChatKeywordPrompt, extractPromptReference } = require('../service/UserService');
const { freeGenerateImageService, freeGenerateImage } = require('../service/FreeGenerateImageService');
const { paidGenerateImageService } = require('../service/PaidGenerateImageService');
const { uploadImageToServer } = require('../service/UploadToServerService');
const { encrypt } = require('../service/EncrypDecrypt');
const { decrypt } = require('../service/EncrypDecrypt');
const { generateImageWithStability } = require('../service/generateSDImage');
const { getStyleNameById } = require('./UsersController');
const { generateImageWithHuggingFace } = require('../service/GenerateImageWithHuggingFace');
const predefinedStyles = require("../utils/predefinedStyles"); 

exports.userGenerateImageController=async(req,res,next)=>{
    const {prompt,model,chat_id,aspect_ratio,quality,style,use_context} =req.body;

    // const flagged =await promptModerationCheck(prompt)
    // if(flagged){
    //     res.status(403).json({message: "This prompt has been flagged for moderation"})
    //     return
    // }

    const w_h = await handelAspectRatio(quality,aspect_ratio)

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

    // let updatedPrompt = await generateContextPrompt(id,chat_id, prompt, use_context);

    let updatedPrompt;

    const referenceKeywords = await extractPromptReference(prompt);

    if (referenceKeywords && referenceKeywords.length > 0) {
        console.log("Mistral detected reference keywords:", referenceKeywords);

        updatedPrompt = await generateCrossChatKeywordPrompt(id, referenceKeywords, prompt);
    } else {
        updatedPrompt = await generateContextPrompt(id, chat_id, prompt, use_context);
    }

    let styleName = null;  // Declare early so it's available below
    let styleDescription = "";

    const full_Prompt = updatedPrompt;

    if (style) {
        const predefined = predefinedStyles.find(s => s.id === parseInt(style));
        if (predefined) {
            styleName = predefined.name;
            styleDescription = predefined.description;
            updatedPrompt += `, ${styleDescription}`;
        } else {
            styleName = await getStyleNameById(style);
            if (styleName) {
                updatedPrompt += ` in style of ${styleName}`;
                styleDescription = styleName; // or leave empty if you want
            }
        }
    }

    // if (style && style != 0) {
    // styleName = await getStyleNameById(style);
    // if (styleName) {
    //     updatedPrompt += ` in style of ${styleName}`;
    // }
    // }

    // encrypt
    const encryptedPrompt = encrypt(prompt);
    const encryptedFullPrompt = encrypt(full_Prompt);
        
    if(model==1 || model==null){
        const canUserGenerateForFree= await canUserGenerateFree(decodeToken.id)
        
        //exiting if the limit exceeded
        if (!canUserGenerateForFree.success) {
            // Use handelModel to get the correct credit cost for model 1
            const modelData = await handelModel(model, aspect_ratio, quality);

            if (!modelData.success) {
                res.status(modelData.status).json({ message: modelData.message });
                return;
            }

            // Use cp_required from the model config
            const hasCredits = await checkCreditBalance(id, modelData.cp_required);

            if (!hasCredits) {
                res.status(429).json({
                    message: "You have reached the limit of free images and do not have enough credits. Please buy more credits."
                });
                return;
            }

             const inputs = {
                prompt: updatedPrompt,
                negative_prompt: "skull",
                width: w_h.width,
                height: w_h.height,
                style: style
            };

            // Get model data for paid gen
            // const model_data = await handelModel(model, aspect_ratio, quality);

            // if (!model_data.success) {
            //     res.status(model_data.status).json({ message: model_data.message });
            //     return;
            // }

            let image, modelSource;
            if (modelData.model_type === "stability") {
                if (modelData.hf_model_url) {
                    modelSource = `Hugging Face (${modelData.hf_model_url})`;
                    image = await generateImageWithHuggingFace(inputs, modelData.hf_model_url);
                } else {
                    modelSource = "Stability AI";
                    image = await generateImageWithStability(inputs);
                }
            } else {
                modelSource = `Cloudflare (${modelData.cloudflare_model_url})`;
                image = await paidGenerateImageService(inputs, modelData.cloudflare_model_url);
            }

            if (!image) {
                res.status(429).json({
                    message: `somthing went worng with paid image generation: no image was returned from ${modelSource}. Please try again later or check your model configuration.`
                });
                return;
            }

            // Deduct credits!
            const remaining = await deductCredit(id, modelData.cp_required);

            // Handle chat creation or update
            let chatId = null;
            if (chat_id == null) {
                const newChatId = await createChat(id, prompt);
                chatId = newChatId;
            } else {
                chatId = chat_id;
                await updateChatUpdatedAt(chatId);
            }

            // Store image info in db
            const generated_image_data = {
                user_id: id,
                prompt: encryptedPrompt,
                full_prompt: encryptedFullPrompt,
                model: model != null ? model : 1,
                chat_id: chatId,
                image_url: "storage is not defined",
                aspect_ratio: aspect_ratio,
                quality: quality,
                resolution: `${w_h.width}*${w_h.height}`,
                style: style == 0 ? "none" : styleName || "none"
            };

            const insertImage = await StoreImageInTabel(generated_image_data);
            const image_id = insertImage.insertId;

            const imageUpload = await uploadImageToServer(
                image,
                id.toString(),
                chatId.toString(),
                image_id.toString(),
                'chat',
                token,
                req
            );

            if (!imageUpload.success) {
                res.status(500).json(imageUpload);
                return;
            }

            await StoreIMagePathandUrl(image_id, imageUpload.imagePath, imageUpload.imageUrl);

            res.status(200).json({
                image_id: image_id,
                user_id: id,
                chat_id: chatId,
                image_url: imageUpload.imageUrl,
                model: model != null ? model : 1,
                prompt: prompt,
                full_Prompt: updatedPrompt,
                aspect_ratio: aspect_ratio,
                quality: quality,
                resolution: `${w_h.width}*${w_h.height}`,
                credits_remaining: remaining
            });
            return; // END paid model 1 flow
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
            full_prompt: encryptedFullPrompt,
            model:model!=null?model:1,
            chat_id:chatId, 
            image_url:"storage is not defined",
            aspect_ratio:aspect_ratio,
            quality:quality,
            resolution:`${w_h.width}*${w_h.height}`,
            style: style == 0 ? "none" : styleName || "none"
        }
       
        const insertImage = await StoreImageInTabel(generated_image_data)
        const image_id= insertImage.insertId

        //image,userId,chatId,imageId,isChat,isExplore,isLibrary,token 

        const imageUpload = await uploadImageToServer(image,id.toString(),chatId.toString(),image_id.toString(),'chat')

        if(!imageUpload.success){
            res.status(500).json(imageUpload)
            return
        }
        
        const s_p_u=await StoreIMagePathandUrl(image_id,imageUpload.imagePath,imageUpload.imageUrl)

        res.status(200).json({
            image_id: image_id,
            user_id: id,
            chat_id:chatId,
            image_url: imageUpload.imageUrl,
            model:model!=null?model:1,
            prompt:prompt,
            full_Prompt: updatedPrompt,
            aspect_ratio:aspect_ratio,
            quality:quality,
            resolution:`${w_h.width}*${w_h.height}`
          });

        return
    }else{
        // user with credits
        
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

        const enoughCredits =await checkCreditBalance(id,model_data.cp_required)

        if(!enoughCredits){
            res.status(402).json({
                message:"not enough credits"
            })
            return
        }
    
        // const image=await paidGenerateImageService(inputs,model_data.model_url)

        let image;
        let modelSource;

        if (model_data.model_type === "stability") {
            if (model_data.hf_model_url ) {
                console.log("hugging face inference")
                modelSource = `Hugging Face (${model_data.hf_model_url})`;
                image = await generateImageWithHuggingFace(inputs, model_data.hf_model_url);
            } else {
                console.log("stablity ai")
                modelSource = "Stability AI";
                image = await generateImageWithStability(inputs); // Stability AI paid
            }
        } else {
            console.log("cloudflare inference")
            modelSource = `Cloudflare (${model_data.cloudflare_model_url})`;
            image = await paidGenerateImageService(inputs, model_data.cloudflare_model_url); // Cloudflare
        }

        if(!image){
            res.status(429).json({
                message: `somthing went worng with paid image generation: no image was returned from ${modelSource}. Please try again later or check your model configuration.`
            })
            return
        }

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
            full_prompt: encryptedFullPrompt,
            model:model!=null?model:1,
            chat_id:chatId,
            image_url:"storage is not defined",
            aspect_ratio:aspect_ratio,
            quality:quality,
            resolution:`${w_h.width}*${w_h.height}`,
            style: style == 0 ? "none" : styleName || "none"
        }

        const insertImage = await StoreImageInTabel(generated_image_data)
        const image_id= insertImage.insertId;

        const imageUpload = await uploadImageToServer(image,id.toString(),chatId.toString(),image_id.toString(),'chat')

        if(!imageUpload.success){
            res.status(500).json(imageUpload)
            return
        }
        
        
        const s_p_u=await StoreIMagePathandUrl(image_id,imageUpload.imagePath,imageUpload.imageUrl)

        // const credits=await getCreditByUserId(id)
        
        res.status(200).json({
            image_id: image_id,
            user_id: id,
            chat_id:chatId,
            image_url: imageUpload.imageUrl,
            model:model!=null?model:1,
            prompt:prompt,
            full_Prompt: updatedPrompt,
            aspect_ratio:aspect_ratio,
            quality:quality,
            resolution:`${w_h.width}*${w_h.height}`,
            // credits:credits[0].credits,
            credits_remaining: remaining
          });
        return

    }
}