const { encoding_for_model } = require("@dqbd/tiktoken");

const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Count tokens using OpenAI-compatible tokenization.
 * @param {string} text text to tokenize
 * @param {string} [model=DEFAULT_MODEL] model id whose tokenizer should be used
 * @param {Console} [logger=console] optional logger implementing .log
 * @returns {number} token count
 */
function countTokens(text, model = DEFAULT_MODEL, logger = console) {
  if (typeof text !== "string") {
    throw new TypeError("countTokens expects a string input");
  }

  const encoding = encoding_for_model(model);
  const tokens = encoding.encode(text);
  const total = tokens.length;
  encoding.free();

  if (logger && typeof logger.log === "function") {
    logger.log(`Token count (${model}): ${total}`);
  }

  return total;
}

module.exports = { countTokens };
