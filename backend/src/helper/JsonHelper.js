const { jsonrepair } = require("jsonrepair");

const extractValidJson = (text) => {
  if (!text) return null;

  // Extract JSON-like substring
  const match = text.match(/{[\s\S]*}/);
  if (!match) return null;

  let jsonString = match[0];

  // Clean up common issues
  jsonString = jsonString
    .replace(/\/\/.*$/gm, "") // remove comments
    .replace(/\/\*[\s\S]*?\*\//gm, "") // remove block comments
    .replace(/[“”]/g, '"') // fix smart quotes
    .replace(/\n\s*/g, " ") // remove newlines
    .replace(/,\s*([}\]])/g, "$1"); // remove trailing commas

  // If it's double-escaped, unescape
  if (jsonString.includes('\\"') && !jsonString.includes('"{')) {
    jsonString = jsonString.replace(/\\"/g, '"');
  }

  try {
    // 🧠 Try normal JSON.parse first
    return JSON.parse(jsonString);
  } catch (err1) {
    try {
      // 🩹 Try jsonrepair if it fails
      const repaired = jsonrepair(jsonString);
      return JSON.parse(repaired);
    } catch (err2) {
      console.error("❌ Still failed to parse or repair JSON:", err2.message);
      console.log("🔍 Partial content around error:", jsonString.slice(0, 500));
      return null;
    }
  }
};


/**
 * Safely parses JSON with fallback support
 * @param {any} value - Value to parse (string, object, or null)
 * @param {any} fallback - Default value if parsing fails (default: null)
 * @returns {any} Parsed object or fallback value
 */
const safeJsonParse = (value, fallback = null) => {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return fallback;
    }
    
    // Already an object (Sequelize auto-parsed)
    if (typeof value === 'object') {
        return value;
    }
    
    // Not a string, return as-is or fallback
    if (typeof value !== 'string') {
        return fallback;
    }
    
    // Empty string
    if (value.trim() === '') {
        return fallback;
    }
    
    // Parse JSON string
    try {
        return JSON.parse(value);
    } catch (error) {
        console.error('JSON parse error:', error.message);
        return fallback;
    }
};

module.exports = { extractValidJson, safeJsonParse };