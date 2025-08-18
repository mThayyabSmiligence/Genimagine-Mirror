const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");

// __dirname is always available in CommonJS
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

exports.ImageToPromptApi = async (imageArray) => {
    const cloud_flare_acc_id = process.env.CLOUD_FLARE_ACC_ID;
    const cloud_flare_api_key = process.env.CLOUD_FLARE_API_KEY;
    const customPrompt = `Analyze this image thoroughly and generate a comprehensive, detailed prompt for AI image generation that captures every visual element. Include the following aspects in your analysis:

**Visual Elements & Composition**
- Subject(s): Describe all people, objects, animals, or main focal points with specific details about their appearance, positioning, poses, and expressions
- Background: Detail all background elements, scenery, architecture, or environmental features
- Foreground: Note any objects or elements in the immediate foreground
- Composition: Describe the overall layout, rule of thirds usage, symmetry, or asymmetry

**Technical & Artistic Details**
- Lighting: Specify lighting type (natural/artificial), direction, intensity, shadows, highlights, and mood created
- Color palette: List dominant colors, color temperature (warm/cool), saturation levels, and color relationships
- Camera perspective: Note viewpoint (eye-level, bird's eye, worm's eye, close-up, wide shot, etc.)
- Depth of field: Describe what's in focus vs. blurred, bokeh effects
- Art style: Identify photographic style, artistic movement, or visual aesthetic (realistic, stylized, vintage, modern, etc.)

**Fine Details & Textures**
- Materials & textures: Describe surfaces, fabrics, skin tones, hair textures, material properties
- Clothing & accessories: Detail all garments, jewelry, props, or held objects
- Facial features: For people, describe age, ethnicity, hair color/style, facial expressions, eye color
- Environmental details: Weather conditions, time of day, season, atmosphere

**Technical Specifications**
- Image quality: Note if it appears professional, candid, high-resolution, film grain, etc.
- Aspect ratio: Mention if it's portrait, landscape, or square format
- Any special effects: Filters, post-processing effects, artistic treatments

** Angle of View **
- Camera angle: Describe if it's from a top, side, or front view
- Field of view: Mention if it's wide-angle, close-up, or zoomed-in

**Additional Notes**
- Include any additional details or comments about the image
- prompt should be under 600 words

Format your response as a single, cohesive prompt that an AI image generator could use to recreate this image as accurately as possible, including specific technical parameters and artistic directions.`;
    try {
        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/@cf/llava-hf/llava-1.5-7b-hf`,
            {
                image: imageArray,
                prompt: customPrompt,
                max_tokens: 512
            },
            {
                headers: {
                    'Authorization': `Bearer ${cloud_flare_api_key}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        // console.log(response)
        return {
            success: true,
            prompt: response.data.result.description
        };
    } catch (error) { 
        console.error(error.message);
        console.error(error.response.data); 
        return {
            success: false,
            message: error.message
        };
    }
};


