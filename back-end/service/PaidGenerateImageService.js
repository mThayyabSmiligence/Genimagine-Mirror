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

exports.paidGenerateImageService= async(inputs,model_url,retries = 3)=>{
      const url = `https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/${model_url}`;
    
        // try{
        //     const response = await axios.post(
        //         `https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/${model_url}`,
        //         inputs,
        //         {
        //           headers: {
        //             'Authorization': `Bearer ${cloud_flare_api_key}`,
        //             'Content-Type': 'application/json',
        //           },
        //           responseType: 'arraybuffer',
        //         }
        //     );
           
      for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            const response = await axios.post(
              url,
              inputs,
              {
                headers: {
                  'Authorization': `Bearer ${cloud_flare_api_key}`,
                  'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
              }
          );

            const imageBuffer= Buffer.from(response.data,'base64')
            
            return imageBuffer
        }catch(error){
            // console.log("error generating images:" +error)
            // console.error("cloudflare generation error:", error?.response?.data.toString() || error.message);
            const status = error?.response?.status;
            const errorMessage = error?.response?.data?.toString() || error.message;

            console.error(`Attempt ${attempt} - Cloudflare generation error:`, errorMessage);

            // Retry for 429 or "capacity" errors
              if (
                status === 429 ||
                status === 503 || 
                errorMessage.toLowerCase().includes("capacity") || 
                errorMessage.toLowerCase().includes("service unavailable")
              )  {
              if (attempt < retries) {
                const delay = 1000 * attempt; // 1s, 2s, 3s
                console.log(`Retrying in ${delay}ms due to server load...`);
                await new Promise(res => setTimeout(res, delay));
                continue;
              }
            }
            return false;
        }
      }
}