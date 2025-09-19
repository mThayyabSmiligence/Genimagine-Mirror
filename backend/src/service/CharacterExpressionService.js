const e = require("express");
const { ImageGenerationBatch, CharacterExpressionImage, Character } = require("../models");
const axios = require('axios');
const { uploadImageToServer } = require("./UploadToServerService");
require('dotenv').config();

exports.generateCharacterExpressionService = async (user_id, story_id, character_id, emotion, pose) => {
    try {
        const batch = await ImageGenerationBatch.create({ user_id, character_id, status: 'pending' });
        
        for (e of emotion) {
           await CharacterExpressionImage.create({ 
                batch_id: batch.id, 
                character_id, 
                expression_type: 'emotion',
                expression: e,
                status: 'queued',
                story_id, 
                user_id
            });
        }
        for (p of pose) {
            await CharacterExpressionImage.create({ 
                batch_id: batch.id, 
                character_id, 
                expression_type: 'pose',
                expression: p,
                status: 'queued',
                story_id, 
                user_id
            });
        }
        return { status: 200, success: true, message: 'Character expression generated successfully' };
    } catch (e) {
        console.error(e);
        return { status: 500, success: false, message: 'Failed to fetch characters' };
    }
}

exports.generateCharacterExpressionImageService= async (character_id, expression) => {
    try{
        const character= await Character.findOne({ where: { id: character_id } });
        if (!character) return { status: 404, success: false, message: 'Character not found' };
        const chracter_url=character.image_url;

        // const image = await axios
    }catch(e){
        console.error(e);
        return { status: 500, success: false, message: 'Failed to get character expression image' };
    }
}

exports.testGenerateCharacterExpressionImageService = async (character_id, expression) => {
    try{
        const cloud_flare_acc_id=process.env.CLOUD_FLARE_ACC_ID;
        const cloud_flare_api_key=process.env.CLOUD_FLARE_API_KEY;
        console.log(cloud_flare_acc_id, cloud_flare_api_key);

        // return {
        //     status: 200,
        //     success: true,
        //     message: 'Character expression image generated successfully'
        // }
        const character= await Character.findOne({ where: { id: character_id } });
        if (!character) return { status: 404, success: false, message: 'Character not found' };
        const chracter_url=character.image_url;
        const image = await axios.get(chracter_url, { responseType: 'arraybuffer' });
        const imageArray = Array.from(Buffer.from(image.data));
        const payload = {
            prompt: `change the character expression to ${expression}. 
            Generate a full-body portrait with clean background, high quality and given expression.`, 
            width: 704,
            height: 704,
            image: imageArray,
        }
        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/@cf/runwayml/stable-diffusion-v1-5-img2img`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${cloud_flare_api_key}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
            }
        );
        const imageBuffer= Buffer.from(response.data,'base64')
        
        const imageUpload= await uploadImageToServer(imageBuffer, character.user_id, character.story_id, character.id, 'characterExpressionTest');

        return {
            status: 200,
            success: true,
            message: 'Character expression image generated successfully',
            imageUrl: imageUpload.imageUrl,
            imagePath: imageUpload.imagePath
        }
    }catch(e){
        console.error(e);
        return { status: 500, success: false, message: 'Failed to get character expression image' };
    }
}