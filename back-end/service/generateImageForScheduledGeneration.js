const db = require('../config/connectDatabase');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { getStyleNameById } = require("../controller/UsersController");
const { encrypt } = require("./EncrypDecrypt");
const { generateImageWithHuggingFace } = require("./GenerateImageWithHuggingFace");
const { generateImageWithStability } = require("./generateSDImage");
const { paidGenerateImageService } = require("./PaidGenerateImageService");
const { uploadImageToServer } = require("./UploadToServerService");
const { handelAspectRatio, handelModel, checkCreditBalance, deductCredit, createChat, StoreImageInTabel, StoreIMagePathandUrl, updateChatUpdatedAt } = require("./UserService");

async function generateImageForScheduledGeneration({
    user_id,
    prompt,
    model,
    aspect_ratio,
    quality,
    style,
    images_per_run,
    token = null,
    chat_id,
    use_context,
}) {
//     try {
//         // Aspect ratio (width/height)
//         const w_h = await handelAspectRatio(quality, aspect_ratio);

//         // getting jwt token from cookies
//         //     let cookies =null
//         //     let token =null
//         //     let decodeToken=null
            
//         //     try{
//         //         const cookies1 = cookie.parse(req.headers.cookie)
//         //         cookies=cookies1    
//         //         const token1 = cookies.token
//         //         token= token1
//         //         decodeToken= jwt.decode(token)
//         //     }catch(err){
//         //         console.log(err)
//         //     }
    
        
//         // const {id,username,role}= decodeToken

//         // Append style if selected
//         let updatedPrompt = prompt;
//         let styleName = null;
//         if (style && style != 0) {
//             styleName = await getStyleNameById(style);
//             if (styleName) {
//                 updatedPrompt += ` in style of ${styleName}`;
//             }
//         }

//         // Encrypt prompts
//         const encryptedPrompt = encrypt(prompt);
//         const encryptedFullPrompt = encrypt(updatedPrompt);

//         // Model details
//         const modelData = await handelModel(model, aspect_ratio, quality);
//         if (!modelData.success) {
//             throw new Error(modelData.message);
//         }

//         // Check credits
//         const enoughCredits = await checkCreditBalance(user_id, modelData.cp_required);
//         if (!enoughCredits) {
//             throw new Error(`User ${user_id} does not have enough credits`);
//         }

//         // Prepare inputs for the model
//         const inputs = {
//             prompt: updatedPrompt,
//             negative_prompt: "skull",
//             width: w_h.width,
//             height: w_h.height,
//             style: style
//         };

//         // Generate image based on model source
//         let image, modelSource;
//         if (modelData.model_type === "stability") {
//             if (modelData.hf_model_url) {
//                 modelSource = `Hugging Face (${modelData.hf_model_url})`;
//                 image = await generateImageWithHuggingFace(inputs, modelData.hf_model_url);
//             } else {
//                 modelSource = "Stability AI";
//                 image = await generateImageWithStability(inputs);
//             }
//         } else {
//             modelSource = `Cloudflare (${modelData.cloudflare_model_url})`;
//             image = await paidGenerateImageService(inputs, modelData.cloudflare_model_url);
//         }

//         if (!image) {
//             throw new Error(`No image returned from ${modelSource}`);
//         }

//         // Deduct credits
//         const remaining = await deductCredit(user_id, modelData.cp_required);

//         if (global.io) {
//             global.io.to(`user_${user_id}`).emit("creditsUpdated", {
//                 credits_remaining: remaining
//             });
//         }


//         // Create chat for scheduled generation (one per run)
//         let finalChatId;
//         if (!chat_id) {
//             finalChatId = await createChat(user_id, prompt, 1);
//         } else {
//             finalChatId = chat_id;
//             await updateChatUpdatedAt(finalChatId);
//         }

//         // Store placeholder image entry in DB
//         const generated_image_data = {
//             user_id: user_id,
//             prompt: encryptedPrompt,
//             full_prompt: encryptedFullPrompt,
//             model: model != null ? model : 1,
//             chat_id: finalChatId,
//             image_url: "storage is not defined",
//             aspect_ratio: aspect_ratio,
//             quality: quality,
//             resolution: `${w_h.width}*${w_h.height}`,
//             style: style == 0 ? "none" : styleName || "none"
//         };

//         const insertImage = await StoreImageInTabel(generated_image_data);
//         const image_id = insertImage.insertId;

//         // Upload image to server
//         const imageUpload = await uploadImageToServer(
//             image,
//             user_id.toString(),
//             finalChatId.toString(),
//             image_id.toString(),
//             'chat',
//             token
//         );

//         if (!imageUpload.success) {
//             throw new Error(`Image upload failed: ${imageUpload.message}`);
//         }

//         // Update DB with path & URL
//         await StoreIMagePathandUrl(image_id, imageUpload.imagePath, imageUpload.imageUrl);

//         return {
//             success: true,
//             image_id,
//             image_url: imageUpload.imageUrl,
//             chat_id: finalChatId,
//             model,
//             prompt,
//             full_prompt: updatedPrompt,
//             aspect_ratio,
//             quality,
//             resolution: `${w_h.width}*${w_h.height}`
//         };

//     } catch (err) {
//         console.error(`Scheduled generation failed for user ${user_id}:`, err.message);
//         return { success: false, error: err.message };
//     }
// }

try {
    // Handle aspect ratio
    const w_h = await handelAspectRatio(quality, aspect_ratio);

    // Append style if selected
    let updatedPrompt = prompt;
    let styleName = null;
    if (style && style != 0) {
      styleName = await getStyleNameById(style);
      if (styleName) {
        updatedPrompt += ` in style of ${styleName}`;
      }
    }

    // Encrypt prompts
    const encryptedPrompt = encrypt(prompt);
    const encryptedFullPrompt = encrypt(updatedPrompt);

    // Get model info
    const modelData = await handelModel(model, aspect_ratio, quality);
    if (!modelData.success) {
      throw new Error(modelData.message);
    }

    // Check user has enough credits before generation
    const hasCredits = await checkCreditBalance(user_id, modelData.cp_required);
    if (!hasCredits) {
      throw new Error("User does not have enough credits");
    }

    // Prepare inputs for generation
    const inputs = {
      prompt: updatedPrompt,
      negative_prompt: "skull",
      width: w_h.width,
      height: w_h.height,
      style: style,
    };

    // Generate image
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
      throw new Error(`No image returned from ${modelSource}`);
    }

    // Deduct credits only AFTER successful image generation
    const remainingCredits = await deductCredit(user_id, modelData.cp_required);

    // Emit updated credits to user if using socket.io (optional)
    if (global.io) {
      global.io.to(`user_${user_id}`).emit("creditsUpdated", {
        credits_remaining: remainingCredits,
      });
    }

    // Handle chat (create or update)
    let finalChatId;
    if (!chat_id) {
      finalChatId = await createChat(user_id, prompt, 1);
    } else {
      finalChatId = chat_id;
      await updateChatUpdatedAt(finalChatId);
    }

    // Store image placeholder in DB
    const generated_image_data = {
      user_id,
      prompt: encryptedPrompt,
      full_prompt: encryptedFullPrompt,
      model: model != null ? model : 1,
      chat_id: finalChatId,
      image_url: "storage is not defined",
      aspect_ratio,
      quality,
      resolution: `${w_h.width}*${w_h.height}`,
      style: style == 0 ? "none" : styleName || "none",
    };

    const insertImage = await StoreImageInTabel(generated_image_data);
    const image_id = insertImage.insertId;

    // Upload the generated image to server/storage
    const imageUpload = await uploadImageToServer(
      image,
      user_id.toString(),
      finalChatId.toString(),
      image_id.toString(),
      "chat",
      token
    );

    if (!imageUpload.success) {
      throw new Error(`Image upload failed: ${imageUpload.message}`);
    }

    // Update DB record with final path and URL
    await StoreIMagePathandUrl(image_id, imageUpload.imagePath, imageUpload.imageUrl);

    return {
      success: true,
      image_id,
      image_url: imageUpload.imageUrl,
      chat_id: finalChatId,
      model,
      prompt,
      full_prompt: updatedPrompt,
      aspect_ratio,
      quality,
      resolution: `${w_h.width}*${w_h.height}`,
      credits_remaining: remainingCredits,
    };

  } catch (err) {
    console.error(`Scheduled generation failed for user ${user_id}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { generateImageForScheduledGeneration };