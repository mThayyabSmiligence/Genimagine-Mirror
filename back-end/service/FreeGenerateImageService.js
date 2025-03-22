const express = require('express')

const axios = require('axios')
const dotenv =require('dotenv')
const path =require('path');  
dotenv.config({path: path.join(__dirname, 'config', 'config.env')})     

const cloud_flare_acc_id= process.env.CLOUD_FLARE_ACC_ID
const cloud_flare_api_key=process.env.CLOUD_FLARE_API_KEY

const styleList = [
  { id: 1, style_name: "Textured Oil Painting", },
  { id: 2, style_name: "Chalk and Charcoal", },
  { id: 3, style_name: "Chinese Ink Painting", },
  { id: 4, style_name: "Realism", },
  { id: 5, style_name: "3D Render", },
  { id: 6, style_name: "Ink & Wash", },
  { id: 7, style_name: "Bright and Exaggerated Cartoon World", },
  { id: 8, style_name: "Anime", },
  { id: 9, style_name: "Black & White", },
  { id: 10, style_name: "Bokeh",  },
  { id: 11, style_name: "Cinematic",  },
  { id: 12, style_name: "Comic Book",  },
  { id: 13, style_name: "Film Noir",  },
  { id: 14, style_name: "Indian Miniature",  },
  { id: 15, style_name: "Japanese Ukiyo-e",  },
  { id: 16, style_name: "Neon Glow",  },
  { id: 17, style_name: "Pixel Art",  },
  { id: 18, style_name: "Steampunk",  },
  { id: 19, style_name: "Baroque Portrait",  },
  { id: 20, style_name: "Cyberpunk Setting",  },
  { id: 21, style_name: "Delicate Watercolor Painting",  },
  { id: 22, style_name: "Dreamlike and Abstract Composition",  },
  { id: 23, style_name: "Dynamic Graffiti Artwork",  },
  { id: 24, style_name: "Gothic Horror Setting",  },
  { id: 25, style_name: "High Dynamic Range Photography",  },
  { id: 26, style_name: "Monochrome Sketch",  },
  { id: 27, style_name: "Moody Gothic Atmosphere",  },
  { id: 28, style_name: "Mythical World",  },
  { id: 29, style_name: "Pencil Sketch Style",  },
  { id: 30, style_name: "Playful Cartoon Style",  },
  { id: 31, style_name: "Pop Art Style",  },
  { id: 32, style_name: "Richly Detailed Baroque Style",  },
  { id: 33, style_name: "Soft Watercolor Style",  },
  { id: 34, style_name: "Surreal Landscape",  },
  { id: 35, style_name: "80s inspired vaporwave style",  },
  { id: 36, style_name: "Thick Oil Painting Style",  },
  { id: 37, style_name: "Ultra Realistic HDR Style",  },
  { id: 38, style_name: "Urban Street Art Style",  },
  { id: 39, style_name: "Vaporwave Aesthetic",  },
  { id: 40, style_name: "Vibrant Pop Art Illustration",  }
]

exports.freeGenerateImage = async(inputs) => {
  const prompt= inputs.prompt;
    try{
        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`,
            {
              prompt: inputs.prompt,
              negative_prompt: inputs.negative_prompt,
              width: inputs.width,
              height: inputs.height,
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
       
        return  Buffer.from(response.data)
    }catch(error){
        console.log("error generating images:" ,error)
        console.log(typeof(inputs.width),typeof(inputs.height));
        return false;
    }

}