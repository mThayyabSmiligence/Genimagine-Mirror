const { llama3BInstructText } = require("../../../API/CloudFlare.api");
const { extractValidJson } = require("../../../helper/JsonHelper");
const AppError = require("../../../utils/AppError");

const generateModuleContent = async (module_data) => {
    const MAX_ATTEMPTS = 5;
    let attempt = 0;
    let response = null;
    try {
        const user_prompt={
            "title": module_data.title,
            "description": module_data.description,
            "tech_tag": module_data.tech_tag,
            "difficulty": module_data.difficulty
        }

        const fullprompt=[
            {
                "role": "system",
                "content": systemPrompt
            },
            {
                "role": "user",
                "content": JSON.stringify(user_prompt)
            }
        ]

        

        // const response = await llama3BInstructText(fullprompt, (max_tokens = 7000));


        while (attempt < MAX_ATTEMPTS) {
            try {
                if (attempt > 0) {
                    console.log(
                        `Retrying llama API call... Attempt ${attempt + 1}`
                    );
                }

                response = await llama3BInstructText(fullprompt, 7000);

                if (!response) {
                    throw new Error("Empty response from llama API");
                }

                break; // ✅ success → exit retry loop

            } catch (error) {
                console.error(
                    `Llama API failed (Attempt ${attempt + 1}):`,
                    error.message
                );

                attempt++;

                // optional small delay
                await new Promise(res => setTimeout(res, 1000));
            }
        }

        // ❌ All retries failed
        if (!response) {
            throw new AppError(
                `LLaMA API failed after ${MAX_ATTEMPTS} attempts for ${module_data.id || module_data.title}`,
                500
            );
        }


        const validJson = extractValidJson(response);

        if (!Array.isArray(validJson) || validJson.length === 0) {
          // throw new AppError(
          //   `Module content generation failed: invalid JSON for module ${module_data.id || module_data.title}`,
          //   500
          // );
          return false;
        }

        
        
        // console.log("response",validJson);
        return validJson;
    } catch (error) {
        console.error('Error generating module content:', error);
        throw error;
    }
}
const systemPrompt = `You are a "Learning Objective Content Generator" assistant.

INPUT:
- The user will provide a single module JSON object containing:
  - "title"
  - "description"
  - "tech_tag"
  - "difficulty"

YOUR TASK:
Generate **4 to 5 learning objectives** for this module.
For each learning objective, generate a **continuous flow of instructional content**, represented as a list of “blocks” and each learning module shuod atleast contain 6 to 8 blocks.

You DO NOT create slides.  
You ONLY create blocks.  
The user will later divide these blocks into slides manually.

-----------------------------------
BLOCK RULES
-----------------------------------
Each learning objective contains a "blocks" array.

Each block must be one of the following types:

1. **Text Block**
{
  "type": "text",
  "text": "Paragraph of explanation..."
}

2. **Code Block**
{
  "type": "code",
  "language": "<programming_language>",
  "code": "valid code here..."
}

3. **Bullet Points Block**
{
  "type": "bullet_points",
  "items": [ "point 1", "point 2", "point 3" ]
}

-----------------------------------
CONTENT RULES
-----------------------------------
- The blocks together must form **one continuous explanation flow**.
- The flow must include:
  - Explanation  
  - Example(s)  
  - More explanation  
  - More examples (if needed)  
  - Code example (only if relevant; otherwise skip code block)  
  - Optional bullet points for key notes or best practices
- The ENTIRE block sequence should be sized so it naturally fits into **2–3 slides**.
- Keep content detailed, but not too long.
- Code examples must be accurate for the module’s technology.
- No slide structure should appear in the output—only blocks.

-----------------------------------
OUTPUT STRUCTURE
-----------------------------------
Return a **JSON array** where each element is a learning objective:

{
  "objective_title": "string",
  "objective_description": "string",
  "blocks": [
    { ...block 1... },
    { ...block 2... },
    { ...block 3... },
    ...
  ]
}

-----------------------------------
OUTPUT FORMAT RULES
-----------------------------------
- Output ONLY JSON.
- No comments or explanations outside JSON.
- No trailing commas.
- Exactly 4–5 learning objectives.

-----------------------------------
EXAMPLE SHAPE (STRUCTURE ONLY)
-----------------------------------
[
  {
    "objective_title": "Inserting Data into MySQL Tables",
    "objective_description": "Learners will learn to insert data into the 'Employees' and 'Tasks' tables...",
    "blocks": [
      { "type": "text", "text": "The INSERT statement allows us to add new rows to a table." },
      { "type": "code", "language": "sql", "code": "INSERT INTO Employees (id, name) VALUES (1, 'John');" },
      { "type": "text", "text": "We can also insert multiple rows in a single statement." },
      { "type": "bullet_points", "items": ["Use transactions for bulk inserts.", "Validate data before inserts."] }
    ]
  }
]
`

module.exports = { generateModuleContent }