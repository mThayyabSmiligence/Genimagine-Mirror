// const openai = require("../config/openaiClient");
// exports.testOpenAIService = async () => {
//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         { role: "user", content: "Say hello in one sentence." }
//       ]
//     });

//     console.log("Test success:", completion.choices[0].message.content);
//   } catch (error) {
//     console.error("OpenAI test failed:", error);
//   }
// };
