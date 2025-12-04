const puppeteer = require('puppeteer');
const path = require('path');

const BULLETS_PER_BLOCK = 10;

const moduleContentToBlocks = module => {
  const blocks = [];

  for (const item of module.content || []) {
    if (item.type === "text") {
      blocks.push({
        kind: "text",
        text: item.text
      });
    } else if (item.type === "code") {
      blocks.push({
        kind: "code",
        code: item.code,
        language: item.language || "text"
      });
    } else if (item.type === "bullet_points") {
      const items = item.items || [];
      for (let i = 0; i < items.length; i += BULLETS_PER_BLOCK) {
        blocks.push({
          kind: "bullets",
          items: items.slice(i, i + BULLETS_PER_BLOCK)
        });
      }
    }
  }

  return blocks;
}


const MAX_BLOCKS_FIRST_SLIDE = 4; // title + desc + up to 2 content blocks
const MAX_BLOCKS_PER_SLIDE = 5;   // title + up to 3 content blocks

const moduleToPages = module => {
  const blocks = moduleContentToBlocks(module);
  const pages = [];
  let cursor = 0;

  // ---- First slide ----
  const firstSlideBlocks = blocks.slice(0, MAX_BLOCKS_FIRST_SLIDE);
  pages.push({
    pageTopic: module.title,
    description: module.description, // only here
    blocks: firstSlideBlocks
  });
  cursor = firstSlideBlocks.length;

  // ---- Remaining slides ----
  while (cursor < blocks.length) {
    const pageBlocks = blocks.slice(cursor, cursor + MAX_BLOCKS_PER_SLIDE);
    pages.push({
      pageTopic: module.title,
      // no description on subsequent pages
      blocks: pageBlocks
    });
    cursor += pageBlocks.length;
  }

  return pages;
}


const fs = require("fs");
const { getTempAiLearningOutputPath } = require('../../../helper/tempFileSaver.helper');

const getSlideHtml = (page) => {
  const { pageTopic, description, blocks = [] } = page;

  const blocksHtml = blocks
    .map((block) => {
      if (block.kind === "text") {
        return `<div class="content">${escapeHtml(block.text)}</div>`;
      }

      if (block.kind === "code") {
        return `
          <pre><language>${escapeHtml(block.language)}</language><code>${escapeHtml(cleanCodeBlock(block.code))}</code></pre>
        `;
      }

      if (block.kind === "bullets") {
        const li = (block.items || [])
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("");
        return `<ul class="bullets">${li}</ul>`;
      }

      return "";
    })
    .join("\n");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(pageTopic)}</title>
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
      .subtitle {
        margin-top: 8px;
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
        position: relative;
      }
      language {
        font-size: 10px;
        color: #b1b1b1;
        position: absolute;
        top: 4px;
        right: 7px;
      }
      code {
        color: #e5e7eb;
        font-family: Consolas, Monaco, 'Courier New', monospace;
      }
      .bullets {
        margin-top: 12px;
        padding-left: 24px;
        font-size: 18px;
        line-height: 1.5;
      }
      .bullets li {
        margin-bottom: 6px;
      }
    </style>
  </head>
  <body>
    <div class="slide">
      <h1>${escapeHtml(pageTopic)}</h1>
      ${
        description
          ? `<h2 class="subtitle">${escapeHtml(description)}</h2>`
          : ""
      }
      ${blocksHtml}
    </div>
  </body>
  </html>
  `;
};

// simple helpers
const escapeHtml = (str = "") => {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const cleanCodeBlock = (example = "") => {
  return example.replace(/```[a-zA-Z]*/g, "").replace(/```/g, "").trim();
};

const convertToHtmlToImage = async (html, module_id, objective_id, index) => {
  const outputDir = getTempAiLearningOutputPath('slideImages');
  const filePath = path.join(outputDir, `${module_id}_${objective_id}_${index}.png`);
  const browser = await puppeteer.launch({ headless: 'new' });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0); // avoid navigation timeouts on slower hosts

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 0 });

    await page.setViewport({
      width: 1280,
      height: 720,
    });

    await page.screenshot({
      path: filePath,
      type: "png",
      fullPage: true,
    });

    return filePath;
  } finally {
    await browser.close().catch(() => {});
  }
}

module.exports = { getSlideHtml, moduleToPages, convertToHtmlToImage };
