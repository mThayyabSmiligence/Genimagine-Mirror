const { jsonrepair } = require("jsonrepair");

function extractFirstJsonArray(text) {
  if (!text || typeof text !== "string") return null;

  const start = text.indexOf("[");
  if (start === -1) return null;

  let inString = false;
  let escape = false;
  let depth = 0;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    } else {
      if (ch === '"') {
        inString = true;
        continue;
      }
    }

    if (ch === "[") depth++;
    if (ch === "]") depth--;

    if (depth === 0) return text.slice(start, i + 1);
  }

  return text.slice(start);
}

function cleanupJsonLikeString(jsonString) {
  return jsonString
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//gm, "")
    .replace(/[“”]/g, '"')
    .replace(/,\s*([}\]])/g, "$1");
}

// --------------------------------------------
// it validates only { narration } and Object.keys(x).length === 1, which will reject your new output shape and/or validate the wrong structure.

// function isValidNarrationItem(x) {
//   return (
//     x &&
//     typeof x === "object" &&
//     !Array.isArray(x) &&
//     Object.keys(x).length === 1 &&
//     typeof x.narration === "string" &&
//     x.narration.trim().length > 0
//   );
// }
// --------------------------------------------

function isValidNarrationItem(x) {
  if (!x || typeof x !== "object" || Array.isArray(x)) return false;

  // must have exactly 2 keys
  const keys = Object.keys(x);
  if (keys.length !== 2) return false;
  if (!("pageNo" in x) || !("narration" in x)) return false;

  if (typeof x.pageNo !== "number") return false;
  if (typeof x.narration !== "string" || x.narration.trim().length === 0) return false;

  return true;
}


/**
 * Extract + parse + validate narration output:
 * Expected shape: Array<{ narration: string }>
 */
const extractValidJsonArray = (text, expectedLength) => {
  const raw = extractFirstJsonArray(text);
  if (!raw) return null;

  const candidate = cleanupJsonLikeString(raw);

  const tryParse = (s) => {
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return null;
    if (typeof expectedLength === "number" && parsed.length !== expectedLength) return null;
    if (!parsed.every(isValidNarrationItem)) return null;
    return parsed;
  };

  try {
    return tryParse(candidate);
  } catch (e1) {
    try {
      const repaired = jsonrepair(candidate);
      return tryParse(repaired);
    } catch (e2) {
      return null;
    }
  }
}

module.exports = extractValidJsonArray;

































// const { jsonrepair } = require("jsonrepair");

// /**
//  * Extract the first JSON ARRAY substring from any text.
//  * Uses bracket counting, and ignores brackets inside string literals.
//  */
// function extractFirstJsonArray(text) {
//   if (!text) return null;

//   const start = text.indexOf("[");
//   if (start === -1) return null;

//   let inString = false;
//   let escape = false;
//   let depth = 0;

//   for (let i = start; i < text.length; i++) {
//     const ch = text[i];

//     if (inString) {
//       if (escape) {
//         escape = false;
//       } else if (ch === "\\") {
//         escape = true;
//       } else if (ch === '"') {
//         inString = false;
//       }
//       continue;
//     } else {
//       if (ch === '"') {
//         inString = true;
//         continue;
//       }
//     }

//     if (ch === "[") depth++;
//     if (ch === "]") depth--;

//     if (depth === 0) {
//       return text.slice(start, i + 1);
//     }
//   }

//   // If array never closed, return what we have (jsonrepair may fix it)
//   return text.slice(start);
// }

// function cleanupJsonLikeString(jsonString) {
//   return jsonString
//     .replace(/\/\/.*$/gm, "") // line comments
//     .replace(/\/\*[\s\S]*?\*\//gm, "") // block comments
//     .replace(/[“”]/g, '"') // smart quotes
//     .replace(/\n\s*/g, " ") // collapse newlines
//     .replace(/,\s*([}\]])/g, "$1"); // trailing commas in objects/arrays
// }

// /**
//  * Extract + validate an array from free-form text.
//  * Returns: Array | null
//  */
// function extractValidJsonArray(text) {
//   if (!text) return null;

//   let jsonString = extractFirstJsonArray(text);
//   if (!jsonString) return null;

//   jsonString = cleanupJsonLikeString(jsonString);

//   // Optional: handle a common double-escaped case
//   if (jsonString.includes('\\"') && !jsonString.includes('"[')) {
//     jsonString = jsonString.replace(/\\"/g, '"');
//   }
  
//   const parseArrayOrNull = (s) => {
//     const parsed = JSON.parse(s);
//     return Array.isArray(parsed) ? parsed : null;
//   };

//   try {
//     return parseArrayOrNull(jsonString);
//   } catch (err1) {
//     try {
//       // jsonrepair repairs malformed JSON (including arrays) [web:21]
//       const repaired = jsonrepair(jsonString);
//       return parseArrayOrNull(repaired);
//     } catch (err2) {
//       console.error("❌ Still failed to parse/repair JSON array:", err2.message);
//       console.log("🔍 Partial content around error:", jsonString.slice(0, 500));
//       return null;
//     }
//   }
// }

// module.exports = { extractValidJsonArray };
