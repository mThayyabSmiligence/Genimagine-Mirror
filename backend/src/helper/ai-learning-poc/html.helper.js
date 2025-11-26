const fs = require('fs');
const getSlideHtml = (page) => {
  const { pageTopic, description, content } = page;
  const explanation = content?.explanation || "";
  const example = content?.example || "";

  // Very simple slide layout – improve styling later.
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>${pageTopic}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        width: 1280px;
        height: 720px;
        box-sizing: border-box;
        background: #0f172a;
        color: #f9fafb;
        display: flex;
        flex-direction: column;
      }
      .slide {
        padding: 40px 60px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      h1 {
        font-size: 36px;
        margin: 0;
      }
      h2 {
        font-size: 20px;
        margin: 0;
        color: #e5e7eb;
      }
      .content {
        font-size: 18px;
        line-height: 1.5;
        margin-top: 10px;
        white-space: pre-wrap;
      }
      pre {
        background: #020617;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 16px;
        overflow: hidden;
        max-height: 260px;
        border: 1px solid #1f2937;
      }
      code {
        color: #e5e7eb;
        font-family: Consolas, Monaco, 'Courier New', monospace;
      }
    </style>
  </head>
  <body>
    <div class="slide">
      <h1>${escapeHtml(pageTopic)}</h1>
      <h2>${escapeHtml(description || "")}</h2>
      <div class="content">
        ${escapeHtml(explanation)}
      </div>
      ${example
        ? `<pre><code>${escapeHtml(cleanCodeBlock(example))}</code></pre>`
        : ""
      }
    </div>
  </body>
  </html>
  `;
}

// simple helpers
const escapeHtml = (str = "") =>{
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// remove ``` from fenced code blocks you have in example
const cleanCodeBlock = (example = "") => {
  return example.replace(/```[a-zA-Z]*/g, "").replace(/```/g, "").trim();
}

module.exports = { getSlideHtml };