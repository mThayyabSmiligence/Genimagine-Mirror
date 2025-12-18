const axios = require("axios");

const mistral_baseURL = "https://api.mistral.ai/v1"

const mistralClient = axios.create({
  baseURL: mistral_baseURL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`
  },
  timeout: 20000
});

module.exports = mistralClient; 