const { jsonrepair } = require("jsonrepair");

exports.extractValidJson = (text) => {
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
