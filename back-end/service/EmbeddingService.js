const axios = require("axios");
const weaviate = require("weaviate-ts-client").default;

const client = weaviate.client({
  scheme: "https",   
  host: "6etziuctq1cqr4by95esda.c0.asia-southeast1.gcp.weaviate.cloud", 
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),  
});

(async () => {
  try {
    const meta = await client.misc.metaGetter().do();
    console.log(" Connected to Weaviate:", meta.version);
  } catch (err) {
    console.error(" Cannot connect to Weaviate:", err.message);
  }
})();

const getPromptEmbedding = async (text) => {
  try {
    const response = await axios.post(
      'https://api.api-ninjas.com/v1/embeddings',
      { text },
      {
        headers: {
          'X-Api-Key': process.env.NINJAS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.embedding;
  } catch (err) {
    console.error('Error fetching embedding:', err.response?.data || err.message);
    return null;
  }
};

const storeEmbeddingInWeaviate = async (id, user_id, prompt, full_prompt, chat_id, embedding) => {
  try {
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      throw new Error("Invalid embedding vector");
    }

    const result = await client.data
      .creator()
      .withClassName("PromptEmbedding")
      .withId(id.toString()) // always string for UUID safety
      .withProperties({
        user_id: user_id.toString(),
        chat_id: chat_id.toString(),
        prompt: prompt?.toString() || "",
        full_prompt: full_prompt?.toString() || "",
      })
      .withVector(embedding)
      .do();

    console.log(" Stored prompt embedding in Weaviate", result.id);
    return result;

  } catch (err) {
    console.error(" Failed to store embedding in Weaviate", {
      message: err.message,
      details: err?.response?.errors || err
    });
    throw err;
  }
};


// const storeEmbeddingInWeaviate = async (id, user_id, prompt, full_prompt, chat_id, embedding) => {
//   try {
//     await client.data
//       .creator()
//       .withClassName('PromptEmbedding')
//       .withId(id)
//       .withProperties({
//         user_id: user_id.toString(),
//         chat_id: chat_id.toString(),
//         prompt,
//         full_prompt,
//       })
//       .withVector(embedding)
//       .do();
//       console.log("Vector length:", embedding?.length);

//     console.log("Stored prompt embedding in Weaviate");
//   } catch (err) {
//      console.error("Weaviate insert error ", {
//     message: err.message,
//     details: err?.response?.errors || err
//   });
//   }
// };


const findMostSimilarPrompt = async (user_id, currentEmbedding, chat_id = null, sameChat = false) => {
  try {
    const whereFilter = [
      {
        path: ['user_id'],
        operator: 'Equal',
        valueString: user_id.toString(),
      },
    ];

    if (chat_id) {
      whereFilter.push({
        path: ['chat_id'],
        operator: 'Equal',
        valueString: sameChat ? chat_id.toString() : { valueString: chat_id.toString(), operator: 'NotEqual' }
      });
    }

    const result = await client.graphql.get()
      .withClassName('PromptEmbedding')
      .withFields('prompt full_prompt chat_id _additional { distance }')
      .withNearVector({
        vector: currentEmbedding,
        certainty: 0.7,
      })
      .withWhere({
        operator: 'And',
        operands: whereFilter
      })
      .withLimit(3)
      .do();

    const results = result.data.Get.PromptEmbedding || [];
    return results.length > 0 ? results[0] : null;

  } catch (err) {
    console.error(" Weaviate vector search error:", err.message || err);
    return null;
  }
};


module.exports = {
  getPromptEmbedding,
  storeEmbeddingInWeaviate,
  findMostSimilarPrompt,
};
