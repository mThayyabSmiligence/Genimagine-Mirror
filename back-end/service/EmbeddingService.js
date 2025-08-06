// const axios = require('axios');
// const { createClient } = require('weaviate-ts-client');

// const client = createClient({
//   scheme: 'http', // or 'https' if on Weaviate Cloud
//   host: process.env.WEAVIATE_HOST.replace(/^https?:\/\//, ''),
//   headers: process.env.WEAVIATE_API_KEY ? {
//     'X-API-KEY': process.env.WEAVIATE_API_KEY
//   } : {}
// });

// const getPromptEmbedding = async (text) => {
//   try {
//     const response = await axios.post(
//       'https://api.api-ninjas.com/v1/embeddings',
//       { text },
//       {
//         headers: {
//           'X-Api-Key': process.env.NINJAS_API_KEY,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     return response.data.embedding;
//   } catch (err) {
//     console.error('Error fetching embedding:', err.response?.data || err.message);
//     return null;
//   }
// };

// const storeEmbeddingInWeaviate = async (id, user_id, prompt, full_prompt, chat_id, embedding) => {
//   try {
//     await client.data
//       .creator()
//       .withClassName('PromptEmbedding')
//       .withId(id)
//       .withProperties({
//         user_id,
//         prompt,
//         full_prompt,
//         chat_id,
//       })
//       .withVector(embedding)
//       .do();
//     console.log(" Stored prompt embedding in Weaviate");
//   } catch (err) {
//     console.error(" Failed to store embedding in Weaviate:", err.message || err);
//   }
// };

// const findMostSimilarPrompt = async (user_id, currentEmbedding, chat_id = null) => {
//   try {
//     const result = await client.graphql.get()
//       .withClassName('PromptEmbedding')
//       .withFields('prompt full_prompt chat_id _additional { vector distance }')
//       .withNearVector({
//         vector: currentEmbedding,
//         certainty: 0.7
//       })
//       .withWhere({
//         path: ['user_id'],
//         operator: 'Equal',
//         valueString: user_id.toString(),
//       })
//       .withLimit(5)
//       .do();

//     const results = result.data.Get.PromptEmbedding || [];
//     const filtered = results.find(r => r.chat_id !== chat_id?.toString());
//     return filtered || null;
//   } catch (err) {
//     console.error(" Weaviate vector search error:", err.message || err);
//     return null;
//   }
// };

// module.exports = {
//   getPromptEmbedding,
//   storeEmbeddingInWeaviate,
//   findMostSimilarPrompt,
// };
