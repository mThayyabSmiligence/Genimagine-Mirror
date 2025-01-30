const dotenv =require('dotenv')
const path =require('path')

dotenv.config({path: path.join(__dirname, 'config', 'config.env')})


const cloud_flare_acc_id= process.env.CLOUD_FLARE_ACC_ID
const cloud_flare_api_key=process.env.CLOUD_FLARE_API_KEY


const canUserGenerateFree=async(data,type)=>{
    
}

const generateImageUser = async(userData,inputsData) => {
    const inputs=""

    try{

        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`,
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
        const imageBuffer= Buffer(response.data,'base64')
        if (type == "guest") {
            const guestImageCount = GuestImageCount(data);     
        }else if(type=="user"){
        
            console.log('user image count is increased')
        }
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
            model_url=process.env.MODEL_3
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
