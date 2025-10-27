const path = require("path");
const fs = require("fs");
const gTTS = require("gtts");
const ffmpeg = require("fluent-ffmpeg");
const { getAudioDurationInSeconds } = require("get-audio-duration");
const { v4: uuidv4 } = require("uuid");

const StoryToVideoError = require("../../utils/StoryToVideoError");
const { downloadImageFromUrl, cleanupTempFiles } = require("../../helper/file.helper");
const { createSlideshowWithCustomDurations, combineVideoWithAudio } = require("../../helper/video.helper");


const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const TEMP_IMAGES_DIR = path.join(ROOT_DIR, 'assets/temp/images');
const OUTPUT_DIR = path.normalize(path.join(ROOT_DIR, 'assets/output'));


if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_IMAGES_DIR)) fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });


const generateAndCombineAudioForNarrations = async (narrations, storyToVideoId, language) => {
  try {
    console.log("🎙️ generateAndCombineAudioForNarrations is starting");

    if (!Array.isArray(narrations) || narrations.length === 0) {
      throw new StoryToVideoError('Narrations array is empty or invalid', 400, storyToVideoId);
    }

    const narrationsWithDuration = [];

    await Promise.all(
      narrations.map(async (narration, index) => {
        return new Promise(async (resolve) => {
          try {
            if (!narration || typeof narration.narration !== 'string' || !narration.narration.trim()) {
              console.warn(`⚠️ Skipping empty narration at scene_order ${narration?.scene_order}`);
              narrationsWithDuration[index] = { ...narration, duration: 0, audioFile: null };
              return resolve(null); // skip silently
            }

            const randomNumber = Math.floor(100000 + Math.random() * 900000);
            const audioPath = path.join(AUDIO_DIR, `temp_audio_${randomNumber}.mp3`);
            const gtts = new gTTS(narration.narration.trim(), language || 'en');

            gtts.save(audioPath, async (err) => {
              if (err) {
                console.error(`❌ Error generating audio for scene ${narration.scene_order}:`, err.message);
                narrationsWithDuration[index] = { ...narration, duration: 0, audioFile: null };
                return resolve(null);
              }

              try {
                const duration = await getAudioDurationInSeconds(audioPath);
                narrationsWithDuration[index] = { ...narration, duration, audioFile: audioPath };
                console.log(`✅ Scene ${narration.scene_order}: audio generated (${duration.toFixed(2)}s)`);
                resolve(audioPath);
              } catch (durationError) {
                console.error("❌ Error reading audio duration:", durationError);
                narrationsWithDuration[index] = { ...narration, duration: 0, audioFile: null };
                resolve(null);
              }
            });
          } catch (innerErr) {
            console.error(`❌ Unexpected audio gen error (scene ${narration?.scene_order}):`, innerErr);
            narrationsWithDuration[index] = { ...narration, duration: 0, audioFile: null };
            resolve(null);
          }
        });
      })
    );

    const validAudioFiles = narrationsWithDuration.filter(n => n.audioFile);

    if (validAudioFiles.length === 0) {
      throw new StoryToVideoError('All narrations failed or were empty', 422, storyToVideoId);
    }

    const combinedAudioPath = path.join(AUDIO_DIR, `combined_audio_${Date.now()}.mp3`);

    await new Promise((resolve, reject) => {
      let command = ffmpeg();
      validAudioFiles.forEach(n => command = command.input(n.audioFile));

      command
        .complexFilter([
          validAudioFiles.map((_, i) => `[${i}:a]`).join('') +
          `concat=n=${validAudioFiles.length}:v=0:a=1[outa]`
        ])
        .outputOptions(['-map', '[outa]'])
        .save(combinedAudioPath)
        .on('end', () => {
          console.log('✅ Audio files combined successfully');
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ Error combining audio files:', err);
          reject(err);
        });
    });

    // cleanup
    narrationsWithDuration.forEach(n => {
      if (n.audioFile && fs.existsSync(n.audioFile)) {
        try {
          fs.unlinkSync(n.audioFile);
        } catch (err) {
          console.warn(`⚠️ Could not delete ${n.audioFile}: ${err.message}`);
        }
      }
    });
    

    return {
      combinedAudioPath,
      narrations: validAudioFiles,
      totalDuration: validAudioFiles.reduce((sum, n) => sum + n.duration, 0),
      success: true
    };

  } catch (error) {
    console.error("❌ Error generating and combining audio:", error);
    throw new StoryToVideoError(error.message || 'Failed to create narration audio', 500, storyToVideoId);
  }
};


// Replace your empty function with this complete implementation:
const generateAndCombineVideoForNarrations = async (combinedAudioPath, narrations, totalDuration, storyToVideoId) => {
    try {
        console.log("generateAndCombineVideoForNarrations is starting");
        
        // Step 1: Download all images from AWS URLs
        console.log("📥 Downloading images from AWS...");
        const downloadedImages = [];
        
        await Promise.all(
            narrations.map(async (narration, index) => {
                const filename = `scene_${narration.scene_order}_${uuidv4().substring(0, 8)}.jpg`;
                const localPath = await downloadImageFromUrl(narration.image_url, filename);
                
                downloadedImages[index] = {
                    ...narration,
                    localImagePath: localPath
                };
                
                console.log(`✅ Downloaded: ${filename}`);
            })
        );


        // Step 2: Create slideshow video with dynamic durations
        console.log("🎬 Creating slideshow video...");
        const slideshowVideoPath = path.join(OUTPUT_DIR, `slideshow_${Date.now()}.mp4`);
        
        await createSlideshowWithCustomDurations(downloadedImages, slideshowVideoPath);

        // Step 3: Combine slideshow with audio
        console.log("🎵 Combining video with audio...");
        const finalVideoPath = path.join(OUTPUT_DIR, `final_story_${Date.now()}.mp4`);
        
        // await combineVideoWithAudio(slideshowVideoPath, combinedAudioPath, finalVideoPath);
        await combineVideoWithAudio(slideshowVideoPath, combinedAudioPath, finalVideoPath);
    

        // Step 5: Clean up temporary files
        console.log("🧹 Cleaning up temporary files...");
        await cleanupTempFiles([
            slideshowVideoPath,
            combinedAudioPath,
            ...downloadedImages.map(img => img.localImagePath)
        ]);

        console.log("✅ Video generation completed successfully!");
        
        return {
            success: true,
            videoPath: finalVideoPath,
            duration: totalDuration,
            scenes: narrations.length
        };

    } catch (error) {
        console.error("Error in generateAndCombineVideoForNarrations:", error);
        
        // Cleanup on error
        try {
            const filesToCleanup = [
                path.join(OUTPUT_DIR, `slideshow_${Date.now()}.mp4`),
                path.join(OUTPUT_DIR, `final_story_${Date.now()}.mp4`)
            ];
            await cleanupTempFiles(filesToCleanup);
        } catch (cleanupError) {
            console.warn("Error during cleanup:", cleanupError);
        }

        throw new StoryToVideoError('Failed to generate video', 500,storyToVideoId)
    }
};


module.exports = { generateAndCombineAudioForNarrations, generateAndCombineVideoForNarrations };