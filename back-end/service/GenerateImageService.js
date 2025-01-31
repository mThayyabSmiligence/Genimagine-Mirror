const dotenv =require('dotenv')
const path =require('path')
const jwt =require('jsonwebtoken')
const db = require('../config/connectDatabase');
const axios =require('axios')

dotenv.config({path: path.join(__dirname, 'config', 'config.env')})
 

const cloud_flare_acc_id= process.env.CLOUD_FLARE_ACC_ID
const cloud_flare_api_key=process.env.CLOUD_FLARE_API_KEY

exports.handleGenerateImageUser = async(data, token) => {                                                      
    const model_data=handelModel(data.model)
    
    const decodedtoken=jwt.decode(token)
    

    console.log("model data :"+model_data.model_url)
    const image =await generateImageUser(data.prompt,model_data.model_url)
    if(!image){return false}        
    await increaseFreeGenerationCount(decodedtoken.id )
    return image

}

// exports.canUserGenerateFree=async(id)=>{
//     try{
//         const query = "SELECT * FROM users WHERE user_id = ?"
//         const [data] =await db.execute(query, [id]);
        

//         if(data[0].free_generation_count<20){
//             return true
//         }else{
            
//             let currentDate = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
//             let generatedDate = data[0].last_free_generated.toISOString().split('T')[0]; 

//             if(currentDate==generatedDate){
//                 return false
//             }
//             else{
//                 await resetFreeGenerationCount(data[0].user_id)
//                 return true
//             }
//         }
//     }catch(err){
//         console.log(err )
//     }
// }

const resetFreeGenerationCount =async(id)=>{
    try{
        const query ="UPDATE users SET free_generation_count =0, last_free_generated = NOW() WHERE id = ?;"
        const [data]=db.execute(query,[id])
        console.log("free generation is resested for user")
    }catch(err){
        console.log("error reseting the free generation count for user")
    }
}

// const increaseFreeGenerationCount=async(id)=>{
//     try{
//         const query = "UPDATE users SET free_generation_count = free_generation_count + 1, last_free_generated = NOW() WHERE user_id = ?;"
//         const [data] =await db.execute(query, [id]);
//         console.log("free image generation count for user is increased")
//         return true;
//     }catch(err){
//         console.log(err)
//     }
// }



const generateImageUser = async(inputs,model_url) => {
  

    try{

        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/${model_url}`,
            {
                prompt:inputs
            },
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
        const imageBuffer= Buffer(response.data,'base64')
        
        return imageBuffer
    }catch(error){
        console.log("error generating images:" +error)
        return false;
    }
}

const handelModel=(modelType)=>{

    let model_url=null
    let cp_required=null

    switch(modelType){
        case 1:{
            model_url=process.env.MODEL_1
            cp_required=0;
            break
        }
        
        case 2:{
            model_url=process.env.MODEL_2   
            cp_required=5;
            break
        }

        case 3:{
            model_url=process.env.MODEL_3
            cp_required=10;
            break
        }
        default:{
            model_url=process.env.MODEL_1
            cp_required=0;
            break
        }
    }

    return {
        "model_url":model_url,
        "cp_required":cp_required
    }
}
