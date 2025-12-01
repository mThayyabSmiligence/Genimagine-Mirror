const { llama3BInstructText } = require("../../../API/CloudFlare.api");
const { extractValidJson } = require("../../../helper/JsonHelper");

const generateModuleContent = async (module_data) => {
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

        const response = await llama3BInstructText(fullprompt,max_tokens=5000);
        const validJson = extractValidJson(response);
        console.log("response",validJson);
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
For each learning objective, generate a **continuous flow of instructional content**, represented as a list of “blocks”.

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