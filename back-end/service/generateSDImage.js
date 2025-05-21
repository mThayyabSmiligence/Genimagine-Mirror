import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const generateSDImage = async (inputs) => {
    const apiKey = process.env.STABILITY_API_KEY;
    const apiHost = process.env.API_HOST ?? 'https://api.stability.ai';
    const engineId = 'stable-diffusion-v1-6';

    if (!apiKey) throw new Error("Missing Stability API Key");

    const payload = {
        text_prompts: [
            {
                text: inputs.prompt,
            },
        ],
        cfg_scale: 7,
        height: inputs.height,
        width: inputs.width,
        steps: 30,
        samples: 1,
    };

    try {
        const response = await fetch(
            `${apiHost}/v1/generation/${engineId}/text-to-image`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            console.error("Stability API error:", await response.text());
            return null;
        }

        const data = await response.json();
        const imageBase64 = data.artifacts[0]?.base64;
        return imageBase64 ? `data:image/png;base64,${imageBase64}` : null;

        //  const imageBase64 = data.artifacts[0]?.base64;

        // if (!imageBase64) return null;

    
        // const filename = `${uuidv4()}.png`;
        // const outputPath = path.join('public', 'generated', filename);

        // fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        // fs.writeFileSync(outputPath, Buffer.from(imageBase64, 'base64'));

        // Return image path or URL
        // return `/generated/${filename}`;
    } catch (error) {
        console.error("Error generating image from Stability AI:", error);
        return null;
    }
};

// import fetch from 'node-fetch';

// export const generateImageWithStability = async (prompt) => {
//   const engineId = 'stable-diffusion-v1-6';
//   const apiHost = process.env.API_HOST ?? 'https://api.stability.ai';
//   const apiKey = process.env.STABILITY_API_KEY;

//   if (!apiKey) throw new Error('Missing Stability API key.');

//   const response = await fetch(
//     `${apiHost}/v1/generation/${engineId}/text-to-image`,
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         text_prompts: [{ text: prompt }],
//         cfg_scale: 7,
//         height: 1024,
//         width: 1024,
//         steps: 30,
//         samples: 1,
//       }),
//     }
//   );

//   if (!response.ok) {
//     throw new Error(`Stability API error: ${await response.text()}`);
//   }

//   const data = await response.json();

//   const base64Image = data.artifacts[0]?.base64;

//   if (!base64Image) throw new Error("Image not generated.");

//   return `data:image/png;base64,${base64Image}`;
// };

