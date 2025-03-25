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


const styleList = [
    { id: 1, style_name: "Textured Oil Painting", },
    { id: 2, style_name: "Chalk and Charcoal", },
    { id: 3, style_name: "Chinese Ink Painting", },
    { id: 4, style_name: "Realism", },
    { id: 5, style_name: "3D Render", },
    { id: 6, style_name: "Ink & Wash", },
    { id: 7, style_name: "Bright and Exaggerated Cartoon World", },
    { id: 8, style_name: "Anime", },
    { id: 9, style_name: "Black & White", },
    { id: 10, style_name: "Bokeh",  },
    { id: 11, style_name: "Cinematic",  },
    { id: 12, style_name: "Comic Book",  },
    { id: 13, style_name: "Film Noir",  },
    { id: 14, style_name: "Indian Miniature",  },
    { id: 15, style_name: "Japanese Ukiyo-e",  },
    { id: 16, style_name: "Neon Glow",  },
    { id: 17, style_name: "Pixel Art",  },
    { id: 18, style_name: "Steampunk",  },
    { id: 19, style_name: "Baroque Portrait",  },
    { id: 20, style_name: "Cyberpunk Setting",  },
    { id: 21, style_name: "Delicate Watercolor Painting",  },
    { id: 22, style_name: "Dreamlike and Abstract Composition",  },
    { id: 23, style_name: "Dynamic Graffiti Artwork",  },
    { id: 24, style_name: "Gothic Horror Setting",  },
    { id: 25, style_name: "High Dynamic Range Photography",  },
    { id: 26, style_name: "Monochrome Sketch",  },
    { id: 27, style_name: "Moody Gothic Atmosphere",  },
    { id: 28, style_name: "Mythical World",  },
    { id: 29, style_name: "Pencil Sketch Style",  },
    { id: 30, style_name: "Playful Cartoon Style",  },
    { id: 31, style_name: "Pop Art Style",  },
    { id: 32, style_name: "Richly Detailed Baroque Style",  },
    { id: 33, style_name: "Soft Watercolor Style",  },
    { id: 34, style_name: "Surreal Landscape",  },
    { id: 35, style_name: "80s inspired vaporwave style",  },
    { id: 36, style_name: "Thick Oil Painting Style",  },
    { id: 37, style_name: "Ultra Realistic HDR Style",  },
    { id: 38, style_name: "Urban Street Art Style",  },
    { id: 39, style_name: "Vaporwave Aesthetic",  },
    { id: 40, style_name: "Vibrant Pop Art Illustration",  }
  ]

exports.userGenerateImageController=async(req,res,next)=>{
    const {prompt,model,chat_id,aspect_ratio,style} =req.body;
    console.log(aspect_ratio)
    console.log("body",req.body)
    console.log("prompt :"+prompt+"model :"+model)

    // const flagged =await promptModerationCheck(prompt)
    // if(flagged){
    //     res.status(403).json({message: "This prompt has been flagged for moderation"})
    //     return
    // }

    const w_h = handelAspectRatio(model,aspect_ratio)
    console.log("w_h",w_h)

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

    const updatedPrompt =style==0?prompt:prompt+" in style of "+styleList[style-1].style_name;

     
        
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
            prompt:prompt,
            model:model!=null?model:1,
            chat_id:chatId,
            image_url:"storage is not defined",
            aspect_ratio:aspect_ratio,
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
        const model_data=handelModel(model)


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
            const newChatId= await createChat(id,prompt);
            const insertedImage = 0;
            chatId=newChatId
        }else{
            chatId=chat_id
            const result = await updateChatUpdatedAt(chatId)
        }
        
        const generated_image_data={
            user_id:id,
            prompt:prompt,
            model:model!=null?model:1,
            chat_id:chatId,
            image_url:"storage is not defined",
            aspect_ratio:aspect_ratio,
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

        const credits=await getCreditByUserId(id)
        
        res.status(200).json({
            image_id: image_id,
            user_id: id,
            chat_id:chatId,
            image_url: imageUpload.imageUrl,
            model:1,
            prompt:prompt,
            aspect_ratio:aspect_ratio,
            resolution:`${w_h.width}*${w_h.height}`,
            credits:credits[0].credits,
          });
        return

    }
}