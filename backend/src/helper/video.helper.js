// Required imports for createSlideshowWithCustomDurations
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');


const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const TEMP_IMAGES_DIR = path.join(ROOT_DIR, 'assets/temp/images');
const OUTPUT_DIR = path.normalize(path.join(ROOT_DIR, 'assets/output'));


if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_IMAGES_DIR)) fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });


const createSlideshowWithCustomDurations = async (images, outputPath) => {
    return new Promise((resolve, reject) => {
        let command = ffmpeg();

        // Add each image as input
        images.forEach(image => {
            command = command.input(image.localImagePath);
        });

        // Create filter complex for custom durations
        const filterInputs = [];
        const concatInputs = [];
        
        images.forEach((image, index) => {
            // Scale and loop each image for its duration
            const duration = Math.max(image.duration, 0.1); // Minimum 0.1 seconds
            const fps = 25; // Standard fps
            const frames = Math.ceil(duration * fps);
            
            filterInputs.push(
                `[${index}:v]scale=1280:720:force_original_aspect_ratio=decrease,` +
                `pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps}[v${index}]`
            );
            
            // Use loop filter to repeat frames for the duration
            filterInputs.push(
                `[v${index}]loop=${frames}:1:0[loop${index}]`
            );
            
            concatInputs.push(`[loop${index}]`);
        });

        // Combine all video segments
        const filterComplex = [
            ...filterInputs,
            `${concatInputs.join('')}concat=n=${images.length}:v=1:a=0[outv]`
        ];

        command
            .complexFilter(filterComplex)
            .outputOptions([
                '-map [outv]',
                '-c:v libx264',
                '-pix_fmt yuv420p',
                '-movflags +faststart'
            ])
            .on('end', () => {
                console.log('✅ Slideshow created successfully');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error creating slideshow:', err);
                reject(err);
            })
            .on('progress', (progress) => {
                console.log('Processing: ' + progress.percent + '% done');
            })
            .save(outputPath);
    });
};

const combineVideoWithAudio = async (videoPath, audioPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(videoPath)
            .input(audioPath)
            .outputOptions([
                '-c:v copy',
                '-c:a aac',
                '-shortest', // Stop when shortest stream ends
                '-movflags +faststart'
            ])
            .on('end', () => {
                console.log('✅ Video and audio combined successfully');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error combining video and audio:', err);
                reject(err);
            })
            .save(outputPath);
    });
};


module.exports = { createSlideshowWithCustomDurations, combineVideoWithAudio }; 