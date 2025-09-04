const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

/**
 * Compose one or more character PNGs into a final scene.
 * layers = [{ input: <buffer|path>, top: <int>, left: <int> }, ...]
 */
exports.composeLayers = async ({ layers, outDir, outName = `scene_${Date.now()}.png` }) => {
  await ensureDir(outDir);

  if (!layers || !layers.length) throw new Error('No layers to compose');

  // Use the first layer as the base
  let base = sharp({
    create: {
      width: 1024,   // default width, adjust as needed
      height: 1024,  // default height, adjust as needed
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 } // fully transparent
    }
  }).png();

  const compositeOps = layers.map(l => ({
    input: l.input,
    top: l.top || 0,
    left: l.left || 0
  }));

  const outPath = path.join(outDir, outName);
  await base.composite(compositeOps).toFile(outPath);

  return outPath;
};
