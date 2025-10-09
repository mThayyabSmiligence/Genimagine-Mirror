const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");

// __dirname is always available in CommonJS
dotenv.config({ path: path.join(__dirname, "config", "config.env") });

const API_URL = process.env.STABILITY_API_URL;
const API_KEY = process.env.STABILITY_API_KEY;

const generateStabilityAiImage = async (prompt) => {
    try {
        const response = await axios.post(
            API_URL +"/text-to-image",
            {
                text_prompts: [{ text: prompt }],
                steps: 30,
                cfg_scale: 7,
                clip_guidance_preset: "FAST_BLUE",
                width: 1024,
                height: 1024,
                samples: 1
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        );

        const imageBase64 = response.data.artifacts[0].base64;
        const imageBuffer = Buffer.from(imageBase64, "base64");
        return imageBuffer;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

module.exports = generateStabilityAiImage;