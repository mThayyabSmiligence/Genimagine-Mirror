const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../../output');

const resolveOutputPath = (subPath = '') => {
  const targetDir = path.resolve(OUTPUT_DIR, subPath || '');
  if (!targetDir.startsWith(OUTPUT_DIR)) {
    throw new Error('Invalid subPath: must stay within output directory');
  }
  return targetDir;
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Persist a temporary file inside ../../output/ and return its full path.
 * @param {string|Buffer|Uint8Array} contents - Data to write.
 * @param {string} [extension='tmp'] - Optional file extension without the dot.
 * @param {string} [subPath=''] - Optional subfolder within /output to place the file.
 * @returns {Promise<string>} Full path to the written file.
 */
const saveTempFileToOutput = async (contents, extension = 'tmp', subPath = '') => {
  const targetDir = resolveOutputPath(subPath);
  ensureDir(targetDir);

  const ext = extension ? (extension.startsWith('.') ? extension : `.${extension}`) : '';
  const filename = `temp-${Date.now()}-${Math.floor(Math.random() * 1e6)}${ext}`;
  const filepath = path.join(targetDir, filename);

  await fs.promises.writeFile(filepath, contents);
  return filepath;
};


const getTempAiLearningOutputPath = (subPath) => {
    const mainPath='ai_learning';
    let aiLearningDir;
    if (subPath) {
        aiLearningDir = resolveOutputPath(path.join(mainPath, subPath));
    } else {
        aiLearningDir = resolveOutputPath(mainPath);
    }
    ensureDir(aiLearningDir);
    return aiLearningDir;
};
const ensureTempDirExist= (path) => {
  ensureDir(tempDir);
};

const deleteTempFile = (filepath) => fs.promises.unlink(filepath);

module.exports = { saveTempFileToOutput, getTempAiLearningOutputPath ,ensureTempDirExist};
