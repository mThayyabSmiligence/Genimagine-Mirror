const axios = require("axios");

exports.generateImageWithHuggingFace = async (inputs, modelURL) => {
  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
  if (!HUGGINGFACE_API_KEY) throw new Error("Missing Hugging Face API key.");

  const url = `https://api-inference.huggingface.co/models/${modelURL}`;

  try {
    const response = await axios.post(
      url,
      { inputs: inputs.prompt },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          // Accept: "application/json",
          Accept: "image/png"
        },
        responseType: "arraybuffer",
      }
    );

    const imageBuffer =  Buffer.from(response.data, "base64");
    return imageBuffer;
  } catch (error) {
    console.error("Hugging Face generation error:", error?.response?.data.toString() || error.message);
    return false;
  }
};
