const axios = require('axios');
const path = require("path");
const fs = require('fs');



const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const TEMP_IMAGES_DIR = path.join(ROOT_DIR, 'assets/temp/images');
const OUTPUT_DIR = path.normalize(path.join(ROOT_DIR, 'assets/output'));


if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_IMAGES_DIR)) fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const downloadImageFromUrl = async (imageUrl, filename) => {
    try {
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream'
        });

        const filePath = path.join(TEMP_IMAGES_DIR, filename);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading image:', error);
        throw error;
    }
};

/**
 * Clean up temporary files from given filePaths.
 * Logs a success message for each file cleaned up, and a warning message for each file that could not be cleaned up.
 * @param {string[]} filePaths - Array of file paths to clean up.
 * @returns {Promise<void>} - Promise that resolves when all files have been cleaned up.
 */
const cleanupTempFiles = async (filePaths) => {
    const cleanupResults = await Promise.allSettled(
        filePaths.map(async (filePath) => {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Cleaned up: ${path.basename(filePath)}`);
                }
            } catch (err) {
                console.warn(`Warning: Could not delete ${filePath}:`, err.message);
            }
        })
    );

    const failedCleanups = cleanupResults.filter(result => result.status === 'rejected');
    if (failedCleanups.length > 0) {
        console.warn(`${failedCleanups.length} files could not be cleaned up`);
    }
};

module.exports = { downloadImageFromUrl, cleanupTempFiles };