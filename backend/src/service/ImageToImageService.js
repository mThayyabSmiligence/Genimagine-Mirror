const axios = require('axios');
const { log } = require('console');
const dotenv = require("dotenv");
const path = require("path");

// __dirname is always available in CommonJS
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

const cloud_flare_acc_id = process.env.CLOUD_FLARE_ACC_ID;
const cloud_flare_api_key = process.env.CLOUD_FLARE_API_KEY;

exports.imageToImageService = async ({ prompt, width, height, strength,guidance, num_steps}, referenceImageUrl) => {
    try {
        console.log("image array ")
        console.log(referenceImageUrl)

        const refRes = await axios.get(referenceImageUrl, { responseType: "arraybuffer" });
        const imageArray = Array.from(Buffer.from(refRes.data));

        const payload = { 
            prompt, 
            width, 
            height, 
            image: imageArray, 
            strength ,
            guidance,
            num_steps
        };
        // if (seed !== undefined) payload.seed = seed;

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

        let imageBuffer = Buffer.from(response.data);

        if (!imageBuffer || imageBuffer.length === 0 || response.headers["content-type"]?.includes("application/json")) {
            const text = Buffer.from(response.data).toString();
            try {
                const json = JSON.parse(text);
                const base64 = json?.result?.image || json?.image || json?.response?.image;
                if (base64) imageBuffer = Buffer.from(base64, "base64");
            } catch (err) {
                console.error("Failed to parse Cloudflare JSON response:", err.message);
            }
        }

        return imageBuffer && imageBuffer.length ? imageBuffer : false;

    } catch (error) {
        console.error("Image-to-Image generation error:", error?.response?.data?.toString() || error.message);
        return false;
    }
};
