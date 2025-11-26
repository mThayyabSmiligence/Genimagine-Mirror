const { PDFParse } = require('pdf-parse');  // Remove .default

const { llama3BInstructText } = require("../../API/CloudFlare.api");
const { extractValidJson } = require('../../helper/JsonHelper');
exports.extractTextFromPDF = async (pdfBuffer) => {
    try {

        const uint8Array = pdfBuffer instanceof Uint8Array
            ? new Uint8Array(pdfBuffer)
            : pdfBuffer;

        const pdf = await new PDFParse(uint8Array);   // async constructor
        const text = (await pdf.getText()).text;             // async method

        console.log("text:", text);
        return text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return null;
    }
};


exports.extractModules= async(text)=>{
    try{

        // const sysPrompt="you are a learning module extractor , you will be provided with a requirement or specification of a project of some sort , you must extract the topic the user needs to learn and seperate them into models and give them in json format in this manner [{topic: string , description: array[string]}], in topic you need to give the topic to the module like , java , html these are for exampple . and in description give what needs to be learned in each point each module must contain atleat 4 to 5 points"

const sysPrompt = `
You are a learning module extractor.

You will be provided with a requirement or specification for a software project or feature.
Your job is to:
1) Identify the technologies, concepts, and skills the user needs to learn.
2) Organize them into a small number of learning modules (usually 2–3 for simple POCs).
3) For each module, create 4–5 pages with clear explanations AND concrete examples (code where relevant).

You MUST output valid JSON with the following exact shape:

{
  "modules": [
    {
      "moduleTopic": "string",
      "pages": [
        {
          "pageTopic": "string",
          "description": "string",
          "content": {
            "explanation": "string",
            "example": "string"
          }
        }
      ]
    }
  ]
}

### SEMANTIC RULES

- "moduleTopic" MUST be a **technology or concept that needs to be learned**, NOT a project feature name.
  - GOOD: "RESTful API Development with Node.js", "MySQL Database Design", "HTTP and JSON Basics"
  - BAD: "Employee Task Tracker Overview", "User Operations", "Task Screens"

- Only create modules that you can describe **properly**.
  - DO NOT create a module if you cannot give at least **4 meaningful pages** with explanation AND example.
  - If a technology is implied but not central, you may skip it instead of adding a weak module.

- Prefer to create **2–3 modules** for small/POC-level requirements, unless the requirement clearly needs more.

### PAGE RULES

Each page MUST have:

- "pageTopic": a specific subtopic under the module.
  - Examples for a REST module: "What is REST", "HTTP Methods", "Status Codes", "Designing REST Endpoints", "JSON Request and Response Bodies"
- "description": a one–two sentence summary of what the learner will understand from this page.
- "content.explanation":
  - A clear, beginner-friendly explanation of the topic.
  - At least a few sentences.
- "content.example":
  - MUST NOT be empty.
  - MUST BE one of:
    - A concrete **code example** (when the topic is technical: APIs, SQL, JSON, backend logic, CRUD, etc.).
    - A concrete **non-code example** (when the topic is conceptual: e.g. an analogy, real-world scenario, or simple text example).

### CODE EXAMPLE RULES (VERY IMPORTANT)

If the page is about a technical topic (like REST API, MySQL, Node.js, HTTP, SQL, JSON, etc.):

- "content.example" MUST contain actual code or structured data.
- If the requirement suggests a stack:
  - Use that language (e.g., Node.js/Express, Java/Spring Boot, Python/Flask).
- If the stack is not clear:
  - Use **JavaScript/Node.js** for API examples.
  - Use **SQL** for database examples.
  - Use **JSON** for request/response body examples.

Examples should be **relevant to the requirement**.
- If the project is about tasks and employees, your examples should use "Task", "Employee", etc. in:
  - Table names
  - API endpoints
  - Sample objects

### QUALITY CONSTRAINTS

- No "example": "" or blank strings.
- No modules with fewer than 4 pages.
- No placeholder text like "review basics yourself" as the only explanation.
- Every module and page must help the user actually learn how to build the described system.

### OUTPUT FORMAT

- Only return the JSON object starting with:
  {
    "modules": [...]
  }
- Do NOT wrap it in any additional fields like "success".
- Do NOT add extra text before or after the JSON.
`;

// const sysPrompt = `
// // You are a learning module extractor.

// // You will be given a requirement or specification for a software project or feature.
// // Your job is to turn that into a learning plan with modules and pages that teach the technologies and concepts needed to build that project.

// // You MUST output ONLY valid JSON in this exact shape:

// // {
// //   "modules": [
// //     {
// //       "moduleTopic": "string",
// //       "pages": [
// //         {
// //           "pageTopic": "string",
// //           "description": "string",
// //           "content": {
// //             "explanation": "string",
// //             "example": "string"
// //           }
// //         }
// //       ]
// //     }
// //   ]
// // }

// // ====================
// // 1. WHAT A MODULE IS
// // ====================

// // - "moduleTopic" MUST be a **technology or conceptual area to learn**, NOT a project feature name.
// //   - GOOD: "RESTful API Development", "MySQL Data Modeling & Queries", "Caching with Redis", "Error Handling & Logging"
// //   - BAD: "Employee Task Tracker Overview", "User Operations", "Dashboard Screens"

// // - A module is a **cluster of related concepts**. You should group pages so that each module feels like a coherent course topic.

// // ===========================
// // 2. WHEN TO USE 1 VS >1 MODULE
// // ===========================

// // You MUST decide the number of modules based on how many major technology areas appear in the requirement:

// // - If the requirement mentions ONLY ONE major area
// //   (for example, it only talks about designing REST APIs, and does NOT mention databases, caching, logging, etc.),
// //   → You MAY return **exactly 1 module**.

// // - If the requirement mentions **two or more** of these major areas, you MUST create at least one module for each area:
// //   - REST / HTTP / APIs / controllers / endpoints
// //   - Database / SQL / MySQL / PostgreSQL / schema / tables / indexes
// //   - Caching / Redis / in-memory cache / TTL / cache invalidation
// //   - Error handling / logging / exceptions / monitoring / HTTP status codes
// //   - Non-functional requirements (performance, rate limiting, pagination, SLAs)

// // Examples:
// // - If both REST APIs AND a database are mentioned:
// //   → you MUST create **at least 2 modules** (one for APIs, one for the database).
// // - If REST APIs, MySQL, and Redis caching are all mentioned:
// //   → you MUST create **at least 3 modules** (API module, DB module, caching module).
// // - Do NOT create extra modules for tiny topics; instead, merge smaller topics into the closest big module (e.g., HTTP status codes inside the REST API module, non-functional requirements into whichever module fits best).

// // There is NO fixed minimum or maximum module count, but:
// // - For simple requirements → usually 1–2 modules.
// // - For rich specs that mention many technologies → often 3–5 modules.

// // ====================
// // 3. PAGES PER MODULE
// // ====================

// // - Every module MUST have **4 to 5 pages**.
// // - Having fewer than 4 pages or more than 5 pages in any module is NOT allowed.

// // Each page MUST have:
// // - "pageTopic": a specific subtopic under the module.
// //   - Examples for a REST module: "HTTP Methods for CRUD", "Designing Task Endpoints", "Query Parameters & Pagination", "HTTP Status Codes", "JSON Request and Response Bodies"
// //   - Examples for a MySQL module: "Task & Employee Table Design", "Indexes for Filtering & Sorting", "Pagination with LIMIT/OFFSET", "Foreign Keys & Cascades"

// // - "description": 1–2 sentence summary of what the learner should understand after this page.

// // - "content.explanation":
// //   - A clear explanation in a few sentences.
// //   - No placeholders like "you should already know this" or "review basics yourself".

// // - "content.example":
// //   - MUST NOT be empty.
// //   - If the topic is technical (API, HTTP, SQL, JSON, Redis, logging implementation, etc.), this MUST be a **short code or structured example**, for example:
// //     - REST API: example endpoint definitions, HTTP request/response bodies, controller method snippet, etc.
// //     - SQL / MySQL: CREATE TABLE, SELECT with WHERE/LIMIT, index usage examples, etc.
// //     - Redis / caching: GET/SET with keys and TTL, cache-aside pseudocode, etc.
// //     - Error handling: example error JSON, example try/catch, logging statement.
// //   - If the topic is conceptual (e.g., "What is REST"), you may give:
// //     - a simple analogy, AND/OR
// //     - a tiny pseudo-example.

// // Examples should be **related to the domain** in the requirement (e.g., tasks, employees, statuses, priorities).

// // ====================
// // 4. QUALITY RULES
// // ====================

// // - Do NOT leave "example" as an empty string.
// // - Do NOT leave any required field blank.
// // - Do NOT collapse everything into a single module if the requirement clearly mentions multiple major areas (e.g. REST, MySQL, Redis, logging).
// // - Every module and page must help someone actually learn how to build the described system.

// // ====================
// // 5. OUTPUT RULES
// // ====================

// // - Output ONLY the JSON object starting with:
// //   {
// //     "modules": [...]
// //   }
// // - Do NOT include any extra keys like "success".
// // - Do NOT include any comments, markdown, or explanation outside the JSON.
// // `;




        const message=[
            {
                role: "system",
                content: sysPrompt
            },
            {
                role: "user",
                content: text
            }
        ]
        
        const response= await   llama3BInstructText(message,2000);
        let modules=extractValidJson(response)

        console.log("modules: ",modules)
        if(typeof modules.modules === 'object' && !Array.isArray(modules.modules)){
            modules = [modules];
        }
        

        return modules

    }catch(err){
        console.error("error extracting modules",err)
        return null;
    }
}