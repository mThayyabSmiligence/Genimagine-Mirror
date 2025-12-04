const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { getSlideHtml } = require('../../helper/ai-learning-poc/html.helper');

const generateSlideImages = async (modulesJson) => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 720 }
  });

  try {
    const outputDir = path.join(__dirname, 'outputs', 'slides');
    fs.mkdirSync(outputDir, { recursive: true });

    const page = await browser.newPage();

    // 🔓 Disable timeouts for this page
    page.setDefaultNavigationTimeout(0); // no navigation timeout
    page.setDefaultTimeout(0);           // no general timeout

    console.log('Generating slides modules', modulesJson);

    const topModules = modulesJson.modules || [];

    for (let mIndex = 0; mIndex < topModules.length; mIndex++) {
      const module = topModules[mIndex];

      if (!module.pages || !Array.isArray(module.pages)) {
        console.warn(`Module ${mIndex} has no pages array, skipping`);
        continue;
      }

      for (let pIndex = 0; pIndex < module.pages.length; pIndex++) {
        const pageData = module.pages[pIndex];

        const html = getSlideHtml(pageData);

        // 🧠 Important: avoid 30s LifecycleWatcher timeout
        // - timeout: 0 disables the 30s default
        // - 'load' is usually safer than 'networkidle0' if your page never goes "idle"
        await page.setContent(html, {
          waitUntil: 'load',
          timeout: 0
        });

        const fileName = `module_${mIndex + 1}_page_${pIndex + 1}.png`;
        const filePath = path.join(outputDir, fileName);

        await page.screenshot({ path: filePath });
        console.log('Created slide:', filePath);
      }
    }

    // Optionally return the list of files created
    return { outputDir };
  } catch (e) {
    console.error('Error in generateSlideImages:', e);
    // rethrow so the API can return a proper error
    throw e;
  } finally {
    await browser.close();
  }
};

module.exports = { generateSlideImages };
