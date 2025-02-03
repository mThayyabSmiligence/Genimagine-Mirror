const express = require('express')
const { GuestUserHandler } = require('../service/GuestUserService')
const cookie = require('cookie');
const db = require('../config/connectDatabase');
const axios = require('axios')
const jwt = require('jsonwebtoken');
const dotenv =require('dotenv')
const path =require('path');
const { canUserGenerateFree, increaseFreeGenerationCountForUser, handelModel, checkCreditBalance, deductCredit, createChat } = require('../service/UserService');
const { freeGenerateImageService, freeGenerateImage } = require('../service/FreeGenerateImageService');
const { paidGenerateImageService } = require('../service/PaidGenerateImageService');


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
            console.log(req.headers)
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

    
        
    if(model==1){
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
        
        
        if(chat_id==null){
            const chatId= await createChat(id);
            const insertedImage = 0;
        }

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

        const enoghCredits =await  checkCreditBalance(id,model_data.cp_required)

        if(!enoghCredits){
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

        res.status(200)
                .set('Content-Type', 'image/png') // Ensure the image MIME type is set
                .send(image);

        return

    }
    
}