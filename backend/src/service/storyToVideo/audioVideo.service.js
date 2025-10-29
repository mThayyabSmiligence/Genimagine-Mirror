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


// Function to generate and combine audio for narrations
//input:
//narration:[{id,scene_order: 1, narration: "Scene 1 narration", image_url: "Scene 1 image url"}]
//storyToVideoId: int
//language: string('en','es'...)
//scene_durations: [{scene_order: 1, duration: 10}, {scene_order: 2, duration: 20}]
//isNew: boolean

//output:
//success: boolean
//combinedAudioPath: string
//narrations: [{id,scene_order: 1, narration: "Scene 1 narration", image_url: "Scene 1 image url", duration: 10,originalDuration: 7, audioFile: "Scene 1 audio file path",}]

const generateAndCombineAudioForNarrations = async (
  narrations,
  storyToVideoId,
  language,
  scene_durations = [],
  isNew = false
) => {
  try {
    console.log("🎙️ generateAndCombineAudioForNarrations is starting");

    if (!Array.isArray(narrations) || narrations.length === 0) {
      if (!isNew) {
        throw new StoryToVideoError('Narrations array is empty or invalid', 400, storyToVideoId);
      }
      return {
        success: false,
        error: "No narrations provided",
        data: null
      };
    }

    const narrationsWithDuration = [];

    await Promise.all(
      narrations.map(async (narration, index) => {
        return new Promise(async (resolve) => {
          try {
            if (!narration || typeof narration.narration !== 'string' || !narration.narration.trim()) {
              console.warn(`⚠️ Skipping empty narration at scene_order ${narration?.scene_order}`);
              narrationsWithDuration[index] = { ...narration, duration: 0, audioFile: null };
              return resolve(null);
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

                // Generate silence of 30% of narration duration
                let silenceDuration ;
                let full_duration;
                if (scene_durations.length > 0) {
                  full_duration = scene_durations.find((d) => d.scene_order === narration.scene_order)?.duration;
                  
                  // FIX 2: Handle undefined and validate the calculation
                  if (full_duration === undefined || full_duration === null) {
                    console.warn(`⚠️ No predefined duration found for scene ${narration.scene_order}, using 30% silence`);
                    silenceDuration = duration * 0.3;
                  } else if (full_duration <= duration) {
                    // FIX 3: Ensure silence duration is never negative
                    console.warn(`⚠️ Scene ${narration.scene_order}: predefined duration (${full_duration}s) <= audio (${duration}s), using minimal silence`);
                    silenceDuration = Math.max(0.1, duration * 0.05); // Minimum 0.1s or 5% of duration
                  } else {
                    silenceDuration = full_duration - duration;
                  }
                } else {
                  silenceDuration = duration * 0.3;
                }

                // FIX 4: Validate silenceDuration before buffer allocation
                if (silenceDuration < 0 || isNaN(silenceDuration)) {
                  console.error(`❌ Invalid silence duration (${silenceDuration}) for scene ${narration.scene_order}, defaulting to 0.5s`);
                  silenceDuration = 0.5;
                }
                const silencePath = path.join(AUDIO_DIR, `silence_${randomNumber}.mp3`);

                await new Promise((resolveSilence, rejectSilence) => {
                    try {
                        // Each second of silence = 44100 samples * 2 channels * 2 bytes = 176400 bytes
                        const totalBytes = Math.ceil(silenceDuration * 44100 * 2 * 2);

                        
                        // FIX 5: Final safety check before buffer allocation
                        if (totalBytes < 0 || totalBytes > Number.MAX_SAFE_INTEGER) {
                          throw new Error(`Invalid buffer size: ${totalBytes} bytes`);
                        }
                        const silenceBuffer = Buffer.alloc(totalBytes, 0);
                        const rawPath = path.join(AUDIO_DIR, `silence_raw_${randomNumber}.pcm`);

                        // Write silent raw PCM file
                        fs.writeFileSync(rawPath, silenceBuffer);

                        // Convert PCM to mp3 using FFmpeg (this part always works on Windows)
                        ffmpeg()
                        .input(rawPath)
                        .inputFormat('s16le')
                        .audioFrequency(44100)
                        .audioChannels(2)
                        .audioCodec('libmp3lame')
                        .duration(silenceDuration)
                        .save(silencePath)
                        .on('end', () => {
                            fs.unlinkSync(rawPath); // cleanup
                            resolveSilence();
                        })
                        .on('error', (err) => {
                            console.error('❌ Failed to encode silence:', err.message);
                            rejectSilence(err);
                        });
                    } catch (err) {
                        rejectSilence(err);
                    }
                });



                narrationsWithDuration[index] = {
                  ...narration,
                  duration: duration + silenceDuration,
                  originalDuration: duration,
                  audioFile: audioPath,
                  silenceFile: silencePath
                };

                console.log(`✅ Scene ${narration.scene_order}: audio (${duration.toFixed(2)}s) + silence (${silenceDuration.toFixed(2)}s)`);
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

    const validAudioFiles = narrationsWithDuration
      .filter(n => n.audioFile)
      .flatMap(n => [n.audioFile, n.silenceFile]); // include silence files sequentially

    if (validAudioFiles.length === 0) {
      if (isNew) {
        throw new StoryToVideoError('All narrations failed or were empty', 422, storyToVideoId);
      }
      return {
        success: false,
        error: "All narrations failed or were empty",
        data: null
      };
    }

    const combinedAudioPath = path.join(AUDIO_DIR, `combined_audio_${Date.now()}.mp3`);

    await new Promise((resolve, reject) => {
      let command = ffmpeg();
      validAudioFiles.forEach(file => command = command.input(file));

      command
        .complexFilter([
          validAudioFiles.map((_, i) => `[${i}:a]`).join('') +
          `concat=n=${validAudioFiles.length}:v=0:a=1[outa]`
        ])
        .outputOptions(['-map', '[outa]'])
        .save(combinedAudioPath)
        .on('end', () => {
          console.log('✅ Audio files (with silence) combined successfully');
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ Error combining audio files:', err);
          reject(err);
        });
    });

    // cleanup temporary files
    narrationsWithDuration.forEach(n => {
      [n.audioFile, n.silenceFile].forEach(file => {
        if (file && fs.existsSync(file)) {
          try {
            fs.unlinkSync(file);
          } catch (err) {
            console.warn(`⚠️ Could not delete ${file}: ${err.message}`);
          }
        }
      });
    });

    return {
      combinedAudioPath,
      narrations: narrationsWithDuration,
      totalDuration: narrationsWithDuration.reduce((sum, n) => sum + n.duration, 0),
      success: true
    };

  } catch (error) {
    console.error("❌ Error generating and combining audio:", error);
    if (isNew) {
      throw new StoryToVideoError(error.message || 'Failed to create narration audio', 500, storyToVideoId);
    }
    return {
      success: false,
      error: error.message || 'Failed to create narration audio',
      data: null
    };
  }
};



// Replace your empty function with this complete implementation:
//input:
//narrations: [{id,scene_order: 1, narration: "Scene 1 narration", image_url: "Scene 1 image url", duration: 10,originalDuration: 7, audioFile: "Scene 1 audio file path",}]
//totalDuration: int
//storyToVideoId: int

//output:
//success: boolean
//videoPath: string
//duration: double
//scenes: int (no of scenes)
const generateVideoForNarrations = async ( narrations, totalDuration, storyToVideoId) => {
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


        

    

        // Step 3: Clean up temporary files
        console.log("🧹 Cleaning up temporary files...");
        await cleanupTempFiles([
            ...downloadedImages.map(img => img.localImagePath)
        ]);

        console.log("✅ Video generation completed successfully!");
        
        return {
            success: true,
            videoPath: slideshowVideoPath,
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


module.exports = { generateAndCombineAudioForNarrations, generateVideoForNarrations };