const dotenv = require("dotenv");
const path = require("path");
const axios = require("axios");
const AppError = require("../utils/AppError");

require("dotenv").config({ path: require("path").resolve(__dirname, "../config.env") });
const api_key = process.env.CLOUD_FLARE_API_KEY;
const account_id = process.env.CLOUD_FLARE_ACC_ID;

const llama3BInstructText=async(messages,max_tokens=500)=>{

    console.log("llama3BInstructText called")
    const model_url = process.env.CLOUD_FLARE_LLAMA_3_8B_INSTRUCT;
    

    const inputs = {
      messages: messages,
      "max_tokens": max_tokens,
      "temperature": 0.7,
      "top_p": 0.9,
      "top_k": 40,
      "repetition_penalty": 1.1,
      "presence_penalty": 0,
      "frequency_penalty": 0,
      "stream": false
    };

    const api_url = "https://api.cloudflare.com/client/v4/accounts/"+account_id+"/ai/run/"+model_url

    try{
        const result = await axios.post(api_url, inputs, {
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json',
            }
            });

        console.log("llama3BInstructText end")
        return result.data.result.response
    }catch(error){
        console.log("llama3BInstructText error : ",error)
        throw new AppError(error.message,500)
    }   
}

const generateImage=async(prompt , width=1024, height=1024,model_url=process.env.MODEL_1)=>{

    const inputs = {
        prompt: prompt,
        width: width,
        height: height,
    };
        try{
            const response = await axios.post(
                `https://api.cloudflare.com/client/v4/accounts/${account_id}/ai/run/${model_url}`,
                inputs,
                {
                  headers: {
                    'Authorization': `Bearer ${api_key}`,
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


module.exports={
    llama3BInstructText,
    generateImage
}