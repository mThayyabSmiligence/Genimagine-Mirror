const express = require('express')
const cookie = require('cookie');
const db = require('../config/connectDatabase');
const axios = require('axios')
const jwt = require('jsonwebtoken');
const dotenv =require('dotenv')
const path =require('path');

dotenv.config({path: path.join(__dirname, 'config', 'config.env')})
  

const cloud_flare_acc_id= process.env.CLOUD_FLARE_ACC_ID
const cloud_flare_api_key=process.env.CLOUD_FLARE_API_KEY

exports.paidGenerateImageService= async(inputs,model_url)=>{
    
        try{
            const response = await axios.post(
                `https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/${model_url}`,
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
            const imageBuffer= Buffer.from(response.data,'base64')
            
            return imageBuffer
        }catch(error){
            console.log("error generating images:" +error)
            console.error("cloudflare generation error:", error?.response?.data.toString() || error.message);
            return false;
        }
}