import fetch from 'node-fetch';

// const axios = require('axios')

// export const generateSDImage = async (inputs) => {
//     const apiKey = process.env.STABILITY_API_KEY;
//     const apiHost = process.env.API_HOST ?? 'https://api.stability.ai';
//     const engineId = 'stable-diffusion-v1-6';

//     if (!apiKey) throw new Error("Missing Stability API Key");

//     const payload = {
//         text_prompts: [
//             {
//                 text: inputs.prompt,
//             },
//         ],
//         cfg_scale: 7,
//         height: inputs.height,
//         width: inputs.width,
//         steps: 30,
//         samples: 1,
//     };

//     try {
//         const response = await fetch(
//             `${apiHost}/v1/generation/${engineId}/text-to-image`,
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Accept: 'application/json',
//                     Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
//                 },
//                 body: JSON.stringify(payload),
//             }
//         );

//         if (!response.ok) {
//             console.error("Stability API error:", await response.text());
//             return null;
//         }

//         const data = await response.json();
//         const imageBase64 = data.artifacts[0]?.base64;
//         return imageBase64 ? `data:image/png;base64,${imageBase64}` : null;
//     } catch (error) {
//         console.error("Error generating image from Stability AI:", error);
//         return null;
//     }
// };

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
  
//   const base64WithPrefix = `data:image/png;base64,${base64Image}`;
  
//   const base64 = base64WithPrefix.split(',')[1];
  
//   // const imageBuffer = Buffer.from(base64Image, 'base64');
  
//   const imageBuffer = Buffer.from(base64, 'base64');
  
//   // return `data:image/png;base64,${base64Image}`;
//   return imageBuffer;
// };






















// without controller


export const generateImageWithStability = async (inputs, res) => {
  const engineId = 'stable-diffusion-v1-6';
  const apiHost = process.env.API_HOST ?? 'https://api.stability.ai';
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) throw new Error('Missing Stability API key.');

  const response = await fetch(
    `${apiHost}/v1/generation/${engineId}/text-to-image`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: inputs.prompt }],
        cfg_scale: 7,
        height: inputs.height,
        width: inputs.width,
        steps: 30,
        samples: 1,
      }),
    }
  );

  //  const response = await axios.post(
  //     `${apiHost}/v1/generation/${engineId}/text-to-image`,
  //     {
  //       text_prompts: [{ text: inputs.prompt }],
  //       cfg_scale: 7,
  //       height: inputs.height || 1024,
  //       width: inputs.width || 1024,
  //       steps: 30,
  //       samples: 1,
  //     },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${apiKey}`,
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //       },
  //     }
  //   );

  if (!response.ok) {
    throw new Error(`Stability API error: ${await response.text()}`);
  }

  const data = await response.json();

  const base64Image = data.artifacts[0]?.base64;

  if (!base64Image) throw new Error("Image not generated.");
  
  const base64WithPrefix = `data:image/png;base64,${base64Image}`;
  
  const base64 = base64WithPrefix.split(',')[1];
  
  const imageBuffer = Buffer.from(base64, 'base64');
  
  res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
    });

    res.end(imageBuffer);
};