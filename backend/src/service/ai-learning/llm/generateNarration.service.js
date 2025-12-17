const { llama3BInstructText } = require("../../../API/CloudFlare.api");
const extractValidJsonArray = require("../../../helper/JsonArrayHelper");
// const { extractValidJson } = require("../../../helper/JsonHelper");
const AppError = require("../../../utils/AppError");

const generateNarrationForLearningObjective = async(learningObjective, pages, spec_id, user_id) =>{
    console.log("generate strp 1")
   const MAX_ATTEMPTS = 5;
    let attempt = 0;
    let response = null;
    let validJson = null;
    try {
        console.log("generate strp 2")
        const fullprompt=[
            {
                "role": "system",
                "content": systemPrompt
            },
            {
                "role": "user",
                "content": JSON.stringify(pages)
            }
        ]

        

        // const response = await llama3BInstructText(fullprompt, (max_tokens = 7000));


        while (attempt < MAX_ATTEMPTS) {
            console.log("generate strp 3")
            try {
                if (attempt > 0) {
                    console.log(
                        `Retrying llama API call... Attempt ${attempt + 1}`
                    );
                }

                response = await llama3BInstructText(fullprompt, 7000);
                console.log("generate strp 4", response);

                console.log("typeof response:", typeof response);
                console.log("isArray response:", Array.isArray(response));
                console.log("response keys:", response && typeof response === "object" ? Object.keys(response) : null);


                if (!response) {
                    throw new Error("Empty response from llama API");
                }


                console.log("expected pages.length:", pages.length);
                console.log("expected pageNos:", pages.map(p => p.pageNo));

                validJson = extractValidJsonArray(response, pages.length);
                console.log("generate strp 5", validJson);

                if (!validJson) {
                    console.log("Raw response head:", response.slice(0, 500));
                    throw new Error("Invalid JSON array extracted from llama response");
                }


                // 3) Validate shape (inside retry)
                if (!Array.isArray(validJson) || validJson.length === 0) {
                    throw new Error("Invalid JSON array extracted from llama response");
                }

                const expectedPageNos = new Set(pages.map(p => p.pageNo));
                const seen = new Set();

                for (const item of validJson) {
                if (!expectedPageNos.has(item.pageNo)) {
                    throw new Error(`Unexpected pageNo: ${item.pageNo}`);
                }
                if (seen.has(item.pageNo)) {
                    throw new Error(`Duplicate pageNo: ${item.pageNo}`);
                }
                seen.add(item.pageNo);
                }

                if (seen.size !== expectedPageNos.size) {
                throw new Error("Missing pageNo in output");
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
        if (!response || !validJson) {
            throw new AppError(
                `LLaMA API failed after ${MAX_ATTEMPTS} attempts for ${learningObjective.id || learningObjective.title}`,
                500
            );
        }

              
        // console.log("response",validJson);
        return validJson;
    } catch (error) {
        console.error('Error generating narration:', error);
        throw error;
    }
}

// const systemPrompt = `You are an expert educator and instructional content writer.

// INPUT
// - You will receive a JSON array of pages belonging to ONE learning objective.
// - Each page has:
//   - pageTopic (string)
//   - description (string, optional)
//   - blocks (array)
// - Each block can be:
//   - text
//   - bullets
//   - code

// TASK
// 1. Read and understand ALL pages together to understand the full learning objective.
// 2. Generate a clear, continuous teaching explanation as if a human instructor is explaining step by step.
// 3. Maintain logical flow and continuity across the full set of pages.
// 4. Generate narration separately for each page, in the same order as input.

// CONTENT RULES
// - Each narration must explain ONLY the content present in that page’s blocks.
// - Do NOT introduce new concepts or examples that are not present in that page’s content.
// - If a page has minimal content, write a short transition-style narration that connects naturally to the next page.
// - Use simple, clear, classroom-style teaching language.
// - Do NOT include headings, bullet points, or markdown in narration text.
// - Do NOT mention the words "page", "slide", "block", or "section".
// - Output ONLY the JSON. Do not include any other text before or after the JSON (no explanations, no notes, no apologies).

// NARRATION OUTPUT STRUCTURE
// - Return a JSON array of objects.
// - Each output object MUST have exactly two keys: "pageNo" and "narration".
// - "pageNo" MUST equal the input page’s pageNo (number).
// - "narration" MUST be a string.
// - Create exactly ONE output object per input pageNo(!important).
// - Output array length MUST equal the number of input pages(!important).
// - If there is only one input page (one pageNo), output MUST contain exactly one object.
// - Never output the same pageNo twice.
// - The set of output pageNo values MUST exactly match the set of input pageNo values (no missing, no duplicates).
// - Order the output by pageNo ascending.


// OUTPUT FORMAT RULES
// - Output ONLY JSON (no extra text before or after).
// - No trailing commas.
// - Every array element MUST be separated by a comma.

// EXAMPLE SHAPE (STRUCTURE ONLY)
// [
//   { "pageNo": 0, "narration": "Narration text for pageNo 0" },
//   { "pageNo": 1, "narration": "Narration text for pageNo 1" }
// ]
// `;


const systemPrompt = `
You are an expert educator and instructional content writer.

INPUT
- You will receive a JSON array of pages belonging to ONE learning objective.
- Each page has:
  - pageNo (number)
  - pageTopic (string)
  - description (string, optional)
  - blocks (array)

STRICT OUTPUT CONTRACT (CRITICAL)
- Let INPUT_PAGE_NOS be the exact set of pageNo values from the input.
- You MUST generate narration for EACH pageNo in INPUT_PAGE_NOS.
- You MUST generate narration for ONLY those pageNo values.
- You MUST generate EXACTLY ONE narration object per pageNo.
- NEVER create additional objects.
- NEVER repeat a pageNo.
- NEVER skip a pageNo.

If this contract is violated, the output is INVALID.

TASK
1. Read ALL pages together to understand the full learning objective.
2. Iterate through the input pages ONE BY ONE.
3. For EACH page:
   - Generate exactly ONE narration.
   - Narration must explain ONLY that page’s blocks.
4. Maintain natural teaching continuity across pages.

CONTENT RULES
- Do NOT introduce concepts not present in that page.
- If a page has minimal content, write a short transition-style explanation.
- Use simple classroom teaching language.
- Do NOT use headings, bullets, markdown, or lists.
- Do NOT mention the words "page", "slide", "block", or "section".
- Output ONLY the JSON. Do not include any other text before or after the JSON (no explanations, no notes, no apologies).

NARRATION OUTPUT STRUCTURE
- Output MUST be a JSON array.
- Each object MUST have exactly TWO keys:
  - "pageNo"
  - "narration"
- The output array length MUST equal the number of input pages.
- Output MUST be ordered by pageNo ascending.
- No trailing commas.
- Output ONLY valid JSON. No text outside JSON.

MANDATORY SELF-CHECK (DO NOT SKIP)
Before producing the final output:
- Count input pages.
- Count output objects.
- Verify both counts match.
- Verify output pageNo set EXACTLY equals input pageNo set.
- If any mismatch exists, FIX IT before outputting.

FINAL RULE
- Output ONLY the JSON.
- Any extra text makes the output INVALID.

EXAMPLE SHAPE (STRUCTURE ONLY)
[
  { "pageNo": 0, "narration": "Narration text for pageNo 0" },
  { "pageNo": 1, "narration": "Narration text for pageNo 1" }
]`;


module.exports = generateNarrationForLearningObjective;


// NARRATION OUTPUT STRUCTURE
// - Return a JSON array of objects.
// - Each array element MUST be an object with exactly one key: "narration".
// - The value of "narration" MUST be a string.
// - The output array length MUST equal the number of input pages.
// - The order MUST match the input page order.
// - Create exactly ONE array element per input page. Do not split a single page’s narration across multiple array elements.
// - For 1 input page, output must be an array with exactly 1 object.