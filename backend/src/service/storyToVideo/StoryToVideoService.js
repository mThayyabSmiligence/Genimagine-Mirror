// backend/src/service/storyToVideo/StoryToVideoService.js
const { llama3BInstructText } = require("../../API/CloudFlare.api");
const { extractValidJson } = require("../../helper/JsonHelper");
const { Scene, StoryToVideo, Story } = require("../../models");
const AppError = require("../../utils/AppError");
const path = require("path");
const gTTS = require('gtts');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { getAudioDurationInSeconds } = require('get-audio-duration');
const { uploadStoryToVideo, uploadSubtitles } = require("../S3Service");
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const StoryToVideoError = require("../../utils/StoryToVideoError");
const { cleanupTempFiles, downloadImageFromUrl } = require("../../helper/file.helper");
const { splitTextIntoChunks, generateSRTFileForLanguage} = require("../../helper/text.helper");
const { getLanguageLabel } = require("../../helper/language.helper");




const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const TEMP_IMAGES_DIR = path.join(ROOT_DIR, 'assets/temp/images');
const OUTPUT_DIR = path.normalize(path.join(ROOT_DIR, 'assets/output'));


if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_IMAGES_DIR)) fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const languageNames = {
        'en': 'English',
        'es': 'Spanish',
        'hi': 'Hindi',
        'fr': 'French',
        'de': 'German',
        'ja': 'Japanese',
        'zh-cn': 'Chinese',
        'pt': 'Portuguese',
        'ar': 'Arabic',
        'ta': 'Tamil',
        'te': 'Telugu'
    };

exports.createStoryToVideoService = async (userId, storyId, ) => {

    console.log("userId : ",userId);
    console.log("storyId : ",storyId);
    const storyToVideoCheck = await StoryToVideo.findOne({ where: { story_id: storyId, user_id: userId } });

    if (storyToVideoCheck && storyToVideoCheck.status == "failed") {
        await StoryToVideo.destroy({ where: { story_id: storyId } });
    }
    else if (storyToVideoCheck) {
        throw new AppError('StoryToVideo already exists', 409)
    };

    const Scenes= await Scene.findAll({ where: { story_id: storyId } });
    console.log("Scenes : ",Scenes);
    if(Scenes === null||Scenes.length === 0){
        throw new AppError('No scenes found for this story', 404)
    };
    
       
    try {
        const storyToVideo = await StoryToVideo.create(
            {
            story_id: storyId,
            user_id: userId,
            }
        );


        return storyToVideo
    } catch (error) {
        console.error("Error creating storyToVideo:", error);
        throw new AppError('Failed to create storyToVideo', 500)
    }  
   
};

exports.getStoryToVideoByStoryIdService = async (storyId, userId) => {
    const storyToVideo = await StoryToVideo.findOne({ where: { story_id: storyId } });
    if (!storyToVideo || storyToVideo.user_id !== userId) {
        throw new AppError('StoryToVideo not found', 404)
    }
    return storyToVideo;
};

exports.deleteStoryToVideoByStoryIdService = async (storyId, userId) => {
    const storyToVideo = await StoryToVideo.findOne({ where: { story_id: storyId } });
    if (!storyToVideo || storyToVideo.user_id !== userId) {
        throw new AppError('StoryToVideo not found', 404)
    }
    try {
        await StoryToVideo.destroy({ where: { story_id: storyId } });
    } catch (error) {
        console.error("Error deleting storyToVideo:", error);
        throw new AppError('Failed to delete storyToVideo', 500)
    }
};

exports.addLanguageStoryToVideoCheck = async (storyToVideoId,language) => {
    const storyToVideo = await StoryToVideo.findOne({ where: { id: storyToVideoId } });
    
    if (!storyToVideo) {
        throw new AppError('StoryToVideo not found', 404)
    }
    
    if(getLanguageLabel(language) === language){
        throw new AppError('Language not supported', 409)
    }
    
    const story = await Story.findOne({ where: { id: storyToVideo.story_id } });

    if (!story) {
        throw new AppError('Story not found', 404)
    }

    if(story.status !== "completed"){
        throw new AppError('Story not completed', 409)
    }

    return true;
}
// exports.startStoryToVideoWorker = async (storyToVideoId) => {

//     let storyToVideo = null;
//     try{
//         console.log("test1");
//         storyToVideo = await StoryToVideo.findOne({ where: { id: storyToVideoId } });
//         if (!storyToVideo) {
//             throw new AppError('StoryToVideo not found', 404)
//         }

//         storyToVideo.status="in-progress";
//         await storyToVideo.save();

//         console.log("test1");
        
//         const scenes = await Scene.findAll({ where: { story_id: storyToVideo.story_id } });
        
//         if(scenes === null||scenes.length === 0){
//             throw new StoryToVideoError('No scenes found for this story', 404,storyToVideoId)
//         };

//         let narrations = await this.nrrativizeTheDescription(scenes,storyToVideoId,storyToVideo.language);
//         console.log("test1");

//         if(narrations === null||narrations.length === 0){
//             throw new StoryToVideoError('No narrations found for this story', 404,storyToVideoId)
//         };

//         const requiredNarrationFormat = narrations.scenesWithNarrations.every(scene => {
//             const narration = scene.narration;
//             return narration !== null && typeof narration === 'string' && 'scene_order' in scene && 'id' in scene && 'image_url' in scene;
//         });
//         if(!requiredNarrationFormat){
//             throw new StoryToVideoError('Narrations are not in the required format', 400, storyToVideoId)
//         }

//         storyToVideo.narrations=narrations.narrations; 
//         storyToVideo.status="generating-audio";
//         await storyToVideo.save();


//         const audioObject = await this.generateAndCombineAudioForNarrations(narrations.scenesWithNarrations,storyToVideoId,storyToVideo.language);
//         console.log("test1");


//         if(audioObject.success === false){
//             throw new StoryToVideoError('Failed to generate audio', 500,storyToVideoId)
//         };

//         console.log(audioObject);
//         narrations = audioObject.narrations
//         console.log("test1");

//         storyToVideo.status="generating-subtitles";
//         await storyToVideo.save();

//         console.log("🌐 Generating multi-language subtitles...");
//         const targetLanguages = ['en', 'es', 'hi', 'fr', 'de', 'ja', 'zh-cn', 'pt', 'ar', 'ta', 'te'];
        
//         const subtitleFiles = await this.generateMultiLanguageSubtitles(
//             narrations,
//             storyToVideoId,
//             storyToVideo.language,
//             targetLanguages
//         );

//         console.log(`✅ Generated ${subtitleFiles.length} subtitle files`);

//         // Store subtitle paths temporarily (you'll upload to S3 and store URLs)
//         const subtitlePathsForUpload = subtitleFiles.map(sf => ({
//             language: sf.language,
//             label: sf.label,
//             localPath: sf.srtPath
//         }));

//         const uploadedSubtitles = await uploadSubtitles(subtitlePathsForUpload, storyToVideoId);


//         storyToVideo.subtitles = uploadedSubtitles;
//         storyToVideo.status="generating-video";
//         await storyToVideo.save();

//         const videoObject = await this.generateAndCombineVideoForNarrations(audioObject.combinedAudioPath, narrations, audioObject.totalDuration,storyToVideoId);

//         console.log("test1");

//         if(videoObject.success === false){
//             storyToVideo.status="failed";
//             storyToVideo.error_message="Failed to generate video";
//             await storyToVideo.save();
//             throw new AppError('Failed to generate video ', 500)
//         };

//         let video_upload;
//         try{
//             const video = fs.readFileSync(videoObject.videoPath);
//             video_upload = await uploadStoryToVideo(video,storyToVideo.story_id,storyToVideo.id);
//             fs.unlinkSync(videoObject.videoPath);
//         }catch(error){
//             console.log(error);
//             storyToVideo.status="failed";
//             storyToVideo.error_message="Failed to upload video";
//             await storyToVideo.save();
//             throw new AppError('Failed to upload video ', 500)
//         }
//         storyToVideo.video_url = video_upload.fileUrl;
//         storyToVideo.video_path = video_upload.path;
//         storyToVideo.status="done";
//         await storyToVideo.save();

//     }catch(error){
//         console.error("Unhandled error in worker:", error);
//         if (storyToVideo) {
//         storyToVideo.status = "failed";
//         storyToVideo.error_message = error.message || "Unknown error";
//         await storyToVideo.save();
//         }
//         throw new StoryToVideoError('Worker failed unexpectedly', 500, storyToVideoId);
//     }
    
// };



// exports.nrrativizeTheDescription = async (scenes,storyToVideoId,language) => {

//     console.log("narrations is starting");
//     // This will return an array of objects, each with a scene_order and description property:
//     // Example: [{scene_order: 1, description: "Scene 1 description"}, {scene_order: 2, description: "Scene 2 description"}]
//     const input = scenes.map((scene) => ({scene_order: scene.scene_order, description: scene.prompt}));

    

//     const targetLanguage = languageNames[language] || 'English';

//     const systemPrompt =`You convert scene descriptions to short, engaging narratives for video narration in a json format with the following structure: [{scene_order: number, narration: string}]. The narration text must be written in ${targetLanguage}. and keep the lables in english and always give object inside the array even if there is only one object.`
//     const message=[
//         {
//             role: "system",
//             content: systemPrompt
//         },
//         {
//             role: "user",
//             content: JSON.stringify(input)
//         }
//     ]

//     const response = await llama3BInstructText(message,2000);
//     let narrations = extractValidJson(response)
//     console.log("narations : ",narrations)
//     let scenesWithNarrations=[];
//     try{
//      scenesWithNarrations = scenes.map((scene, index) => {
//         const narration = narrations.find(n => n.scene_order === scene.scene_order);
//         if (narration) {
//           return {
//             id: scene.id,
//             image_url: scene.image_url,
//             scene_order: scene.scene_order,
//             narration: narration.narration,
//             english_narration: narration.english_narration
//           }
//         } else {
//           return null;
//         }
//       }).filter(s => s !== null);
//     } catch (error) {

//         console.error("Error creating storyToVideo:", error);
//         throw new StoryToVideoError('Failed to generate narrations', 500,storyToVideoId)
        
//     }



//     console.log("scenesWithNarrations : ",scenesWithNarrations)
//     return {
//         narrations,
//         scenesWithNarrations
//     }
    
// };

// exports.generateAndCombineAudioForNarrations = async (narrations, storyToVideoId, language) => {
//   try {
//     console.log("🎙️ generateAndCombineAudioForNarrations is starting");

//     if (!Array.isArray(narrations) || narrations.length === 0) {
//       throw new StoryToVideoError('Narrations array is empty or invalid', 400, storyToVideoId);
//     }

//     const narrationsWithDuration = [];

//     await Promise.all(
//       narrations.map(async (narration, index) => {
//         return new Promise(async (resolve) => {
//           try {
//             if (!narration || typeof narration.narration !== 'string' || !narration.narration.trim()) {
//               console.warn(`⚠️ Skipping empty narration at scene_order ${narration?.scene_order}`);
//               narrationsWithDuration[index] = { ...narration, duration: 0, audioFile: null };
//               return resolve(null); // skip silently
//             }

//             const randomNumber = Math.floor(100000 + Math.random() * 900000);
//             const audioPath = path.join(AUDIO_DIR, `temp_audio_${randomNumber}.mp3`);
//             const gtts = new gTTS(narration.narration.trim(), language || 'en');

//             gtts.save(audioPath, async (err) => {
//               if (err) {
//                 console.error(`❌ Error generating audio for scene ${narration.scene_order}:`, err.message);
//                 narrationsWithDuration[index] = { ...narration, duration: 0, audioFile: null };
//                 return resolve(null);
//               }

//               try {
//                 const duration = await getAudioDurationInSeconds(audioPath);
//                 narrationsWithDuration[index] = { ...narration, duration, audioFile: audioPath };
//                 console.log(`✅ Scene ${narration.scene_order}: audio generated (${duration.toFixed(2)}s)`);
//                 resolve(audioPath);
//               } catch (durationError) {
//                 console.error("❌ Error reading audio duration:", durationError);
//                 narrationsWithDuration[index] = { ...narration, duration: 0, audioFile: null };
//                 resolve(null);
//               }
//             });
//           } catch (innerErr) {
//             console.error(`❌ Unexpected audio gen error (scene ${narration?.scene_order}):`, innerErr);
//             narrationsWithDuration[index] = { ...narration, duration: 0, audioFile: null };
//             resolve(null);
//           }
//         });
//       })
//     );

//     const validAudioFiles = narrationsWithDuration.filter(n => n.audioFile);

//     if (validAudioFiles.length === 0) {
//       throw new StoryToVideoError('All narrations failed or were empty', 422, storyToVideoId);
//     }

//     const combinedAudioPath = path.join(AUDIO_DIR, `combined_audio_${Date.now()}.mp3`);

//     await new Promise((resolve, reject) => {
//       let command = ffmpeg();
//       validAudioFiles.forEach(n => command = command.input(n.audioFile));

//       command
//         .complexFilter([
//           validAudioFiles.map((_, i) => `[${i}:a]`).join('') +
//           `concat=n=${validAudioFiles.length}:v=0:a=1[outa]`
//         ])
//         .outputOptions(['-map', '[outa]'])
//         .save(combinedAudioPath)
//         .on('end', () => {
//           console.log('✅ Audio files combined successfully');
//           resolve();
//         })
//         .on('error', (err) => {
//           console.error('❌ Error combining audio files:', err);
//           reject(err);
//         });
//     });

//     // cleanup
//     narrationsWithDuration.forEach(n => {
//       if (n.audioFile && fs.existsSync(n.audioFile)) {
//         try {
//           fs.unlinkSync(n.audioFile);
//         } catch (err) {
//           console.warn(`⚠️ Could not delete ${n.audioFile}: ${err.message}`);
//         }
//       }
//     });
    

//     return {
//       combinedAudioPath,
//       narrations: validAudioFiles,
//       totalDuration: validAudioFiles.reduce((sum, n) => sum + n.duration, 0),
//       success: true
//     };

//   } catch (error) {
//     console.error("❌ Error generating and combining audio:", error);
//     throw new StoryToVideoError(error.message || 'Failed to create narration audio', 500, storyToVideoId);
//   }
// };


// Replace your empty function with this complete implementation:
// exports.generateAndCombineVideoForNarrations = async (combinedAudioPath, narrations, totalDuration, storyToVideoId) => {
//     try {
//         console.log("generateAndCombineVideoForNarrations is starting");
        
//         // Step 1: Download all images from AWS URLs
//         console.log("📥 Downloading images from AWS...");
//         const downloadedImages = [];
        
//         await Promise.all(
//             narrations.map(async (narration, index) => {
//                 const filename = `scene_${narration.scene_order}_${uuidv4().substring(0, 8)}.jpg`;
//                 const localPath = await downloadImageFromUrl(narration.image_url, filename);
                
//                 downloadedImages[index] = {
//                     ...narration,
//                     localImagePath: localPath
//                 };
                
//                 console.log(`✅ Downloaded: ${filename}`);
//             })
//         );


//         // Step 2: Create slideshow video with dynamic durations
//         console.log("🎬 Creating slideshow video...");
//         const slideshowVideoPath = path.join(OUTPUT_DIR, `slideshow_${Date.now()}.mp4`);
        
//         await createSlideshowWithCustomDurations(downloadedImages, slideshowVideoPath);

//         // Step 3: Combine slideshow with audio
//         console.log("🎵 Combining video with audio...");
//         const finalVideoPath = path.join(OUTPUT_DIR, `final_story_${Date.now()}.mp4`);
        
//         // await combineVideoWithAudio(slideshowVideoPath, combinedAudioPath, finalVideoPath);
//         await combineVideoWithAudio(slideshowVideoPath, combinedAudioPath, finalVideoPath);
    

//         // Step 5: Clean up temporary files
//         console.log("🧹 Cleaning up temporary files...");
//         await cleanupTempFiles([
//             slideshowVideoPath,
//             combinedAudioPath,
//             ...downloadedImages.map(img => img.localImagePath)
//         ]);

//         console.log("✅ Video generation completed successfully!");
        
//         return {
//             success: true,
//             videoPath: finalVideoPath,
//             duration: totalDuration,
//             scenes: narrations.length
//         };

//     } catch (error) {
//         console.error("Error in generateAndCombineVideoForNarrations:", error);
        
//         // Cleanup on error
//         try {
//             const filesToCleanup = [
//                 path.join(OUTPUT_DIR, `slideshow_${Date.now()}.mp4`),
//                 path.join(OUTPUT_DIR, `final_story_${Date.now()}.mp4`)
//             ];
//             await cleanupTempFiles(filesToCleanup);
//         } catch (cleanupError) {
//             console.warn("Error during cleanup:", cleanupError);
//         }

//         throw new StoryToVideoError('Failed to generate video', 500,storyToVideoId)
//     }
// };

/**
 * Generate subtitles in multiple languages
 * @param {Array} narrations - Array of narration objects with scene_order, narration, duration
 * @param {Number} storyToVideoId - Story to video ID
 * @param {String} primaryLanguage - The original language code
 * @param {Array} targetLanguages - Array of language codes to generate subtitles for
 * @returns {Array} Array of subtitle file paths with language info
 */
// exports.generateMultiLanguageSubtitles = async (narrations, storyToVideoId, primaryLanguage, targetLanguages) => {
//     try {
//         console.log("🌐 Starting multi-language subtitle generation...");
        
//         // Default target languages if not provided
//         if (!targetLanguages || targetLanguages.length === 0) {
//             targetLanguages = ['en', 'es', 'hi', 'fr', 'de', 'ja', 'zh-cn', 'pt', 'ar', 'ta', 'te'];
//         }

//         const subtitleData = [];

//         // Process all languages in parallel
//         const results = await Promise.allSettled(
//             targetLanguages.map(async (lang) => {
//                 try {
//                     let translatedNarrations = narrations;

//                     // Translate if not the primary language
//                     if (lang !== primaryLanguage) {
//                         console.log(`📝 Translating to ${lang}...`);
//                         translatedNarrations = await this.translateNarrationsToLanguage(
//                             narrations, 
//                             lang,
//                             storyToVideoId
//                         );
//                     } else {
//                         console.log(`✅ Using original narrations for ${lang}`);
//                     }

//                     // Generate SRT file
//                     const srtPath = generateSRTFileForLanguage(translatedNarrations, lang, storyToVideoId);

//                     return {
//                         language: lang,
//                         label: getLanguageLabel(lang),
//                         srtPath: srtPath,
//                         success: true
//                     };

//                 } catch (error) {
//                     console.error(`❌ Failed to generate subtitle for ${lang}:`, error.message);
//                     return {
//                         language: lang,
//                         label: getLanguageLabel(lang),
//                         srtPath: null,
//                         success: false,
//                         error: error.message
//                     };
//                 }
//             })
//         );

//         // Process results
//         results.forEach((result, index) => {
//             if (result.status === 'fulfilled' && result.value.success) {
//                 subtitleData.push(result.value);
//                 console.log(`✅ ${result.value.label} subtitle generated`);
//             } else {
//                 const lang = targetLanguages[index];
//                 console.warn(`⚠️ ${getLanguageLabel(lang)} subtitle failed`);
//             }
//         });

//         console.log(`🎉 Generated ${subtitleData.length}/${targetLanguages.length} subtitle files`);

//         return subtitleData;

//     } catch (error) {
//         console.error("❌ Error in generateMultiLanguageSubtitles:", error);
//         throw new StoryToVideoError('Failed to generate multi-language subtitles', 500, storyToVideoId);
//     }
// };


/**
 * Translate narrations to target language using LLaMA
 * @param {Array} narrations - Original narrations
 * @param {String} targetLang - Target language code
 * @param {Number} storyToVideoId - Story to video ID for error handling
 * @returns {Array} Translated narrations
 */
// exports.translateNarrationsToLanguage = async (narrations, targetLang, storyToVideoId) => {
//     try {
//         const languageNames = {
//             'en': 'English',
//             'es': 'Spanish',
//             'hi': 'Hindi',
//             'fr': 'French',
//             'de': 'German',
//             'ja': 'Japanese',
//             'zh-cn': 'Simplified Chinese',
//             'pt': 'Portuguese',
//             'ar': 'Arabic',
//             'ta': 'Tamil',
//             'te': 'Telugu'
//         };

//         const targetLanguageName = languageNames[targetLang] || targetLang;

//         // Prepare input for translation
//         const input = narrations.map(n => ({
//             scene_order: n.scene_order,
//             narration: n.narration
//         }));

//         const systemPrompt = `You are a professional translator. Translate the narration text to ${targetLanguageName}. 
// Maintain the emotional tone and context. Keep the JSON structure with scene_order intact.
// Return format: [{"scene_order": number, "narration": "translated text"}]
// Always return a valid JSON array even if there's only one object.`;

//         const message = [
//             {
//                 role: "system",
//                 content: systemPrompt
//             },
//             {
//                 role: "user",
//                 content: JSON.stringify(input)
//             }
//         ];

//         const response = await llama3BInstructText(message, 2500);
//         const translatedData = extractValidJson(response);

//         // Map translated narrations back to original structure with durations
//         const translatedNarrations = narrations.map((original) => {
//             const translated = translatedData.find(t => t.scene_order === original.scene_order);
//             return {
//                 ...original,
//                 narration: translated ? translated.narration : original.narration
//             };
//         });

//         console.log(`✅ Translated ${translatedNarrations.length} narrations to ${targetLanguageName}`);
//         return translatedNarrations;

//     } catch (error) {
//         console.error(`❌ Translation failed for ${targetLang}:`, error);
//         throw new StoryToVideoError(`Failed to translate to ${targetLang}`, 500, storyToVideoId);
//     }
// };

/**
 * Generate SRT file for a specific language
 * @param {Array} narrations - Narrations with timing info
 * @param {String} language - Language code
 * @param {Number} storyToVideoId - Story to video ID
 * @returns {String} Path to generated SRT file
 */
// exports.generateSRTFileForLanguage = (narrations, language, storyToVideoId) => {
//     let srtContent = '';
//     let subtitleIndex = 1;
//     let currentTime = 0;

//     const MAX_CHARS_PER_SUBTITLE = 80;
//     const MAX_DURATION_PER_SUBTITLE = 6;

//     const formatTime = (seconds) => {
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = Math.floor(seconds % 60);
//         const milliseconds = Math.floor((seconds % 1) * 1000);

//         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
//     };

//     narrations.forEach((narration) => {
//         const text = narration.narration;
//         const totalDuration = narration.duration;

//         // Split text into chunks if too long
//         const textChunks = splitTextIntoChunks(text, MAX_CHARS_PER_SUBTITLE);
//         const chunkDuration = totalDuration / textChunks.length;
//         const actualChunkDuration = Math.min(chunkDuration, MAX_DURATION_PER_SUBTITLE);

//         textChunks.forEach((chunk) => {
//             const startTime = currentTime;
//             const endTime = currentTime + actualChunkDuration;

//             // SRT format: index, timing, text, blank line
//             srtContent += `${subtitleIndex}\n`;
//             srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
//             srtContent += `${chunk}\n\n`;

//             subtitleIndex++;
//             currentTime = endTime;
//         });
//     });

//     // Save SRT file
//     const filename = `subtitle_${language}_${storyToVideoId}_${Date.now()}.srt`;
//     const srtPath = path.join(OUTPUT_DIR, filename);
//     fs.writeFileSync(srtPath, srtContent, 'utf8');

//     console.log(`💾 Generated ${language} SRT: ${filename} (${subtitleIndex - 1} segments)`);
//     return srtPath;
// };


/**
 * Helper: Get human-readable language label
 */
// exports.getLanguageLabel = (languageCode) => {
//     const labels = {
//         'en': 'English',
//         'es': 'Spanish (Español)',
//         'hi': 'Hindi (हिंदी)',
//         'fr': 'French (Français)',
//         'de': 'German (Deutsch)',
//         'ja': 'Japanese (日本語)',
//         'zh-cn': 'Chinese (中文)',
//         'pt': 'Portuguese (Português)',
//         'ar': 'Arabic (العربية)',
//         'ta': 'Tamil (தமிழ்)',
//         'te': 'Telugu (తెలుగు)'
//     };
//     return labels[languageCode] || languageCode.toUpperCase();
// };

// exports.translateNarrations = async (narrations, currentLanguage) => {
//     try {
       
//         for(narration of narrations){
//             const translatedNarration = await translateNarration(narration.narration, currentLanguage);
//             narration.narration = translatedNarration;
//         }
//         return translatedNarrations;
//     } catch (error) {
//         console.error("Error translating narrations:", error);
//         throw error;
//     }
// };

// exports.translateText= async(text, currentLanguage, targetLanguage) => {
//     try{
//         const systemprompt="you are a narration translator you will translate the text from "+currentLanguage+" into "+targetLanguage+" and keep the lables in english and always give object inside the array even if there is only one object"

        
//     }catch(err){
//         console.error("Error translating text:", err);
//         throw err;
//     }
// }

// Function to download image from AWS S3 URL
// const downloadImageFromUrl = async (imageUrl, filename) => {
//     try {
//         const response = await axios({
//             method: 'GET',
//             url: imageUrl,
//             responseType: 'stream'
//         });

//         const filePath = path.join(TEMP_IMAGES_DIR, filename);
//         const writer = fs.createWriteStream(filePath);

//         response.data.pipe(writer);

//         return new Promise((resolve, reject) => {
//             writer.on('finish', () => resolve(filePath));
//             writer.on('error', reject);
//         });
//     } catch (error) {
//         console.error('Error downloading image:', error);
//         throw error;
//     }
// };

// Helper function to create slideshow with custom durations for each image
// const createSlideshowWithCustomDurations = async (images, outputPath) => {
//     return new Promise((resolve, reject) => {
//         let command = ffmpeg();

//         // Add each image as input
//         images.forEach(image => {
//             command = command.input(image.localImagePath);
//         });

//         // Create filter complex for custom durations
//         const filterInputs = [];
//         const concatInputs = [];
        
//         images.forEach((image, index) => {
//             // Scale and loop each image for its duration
//             const duration = Math.max(image.duration, 0.1); // Minimum 0.1 seconds
//             const fps = 25; // Standard fps
//             const frames = Math.ceil(duration * fps);
            
//             filterInputs.push(
//                 `[${index}:v]scale=1280:720:force_original_aspect_ratio=decrease,` +
//                 `pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps}[v${index}]`
//             );
            
//             // Use loop filter to repeat frames for the duration
//             filterInputs.push(
//                 `[v${index}]loop=${frames}:1:0[loop${index}]`
//             );
            
//             concatInputs.push(`[loop${index}]`);
//         });

//         // Combine all video segments
//         const filterComplex = [
//             ...filterInputs,
//             `${concatInputs.join('')}concat=n=${images.length}:v=1:a=0[outv]`
//         ];

//         command
//             .complexFilter(filterComplex)
//             .outputOptions([
//                 '-map [outv]',
//                 '-c:v libx264',
//                 '-pix_fmt yuv420p',
//                 '-movflags +faststart'
//             ])
//             .on('end', () => {
//                 console.log('✅ Slideshow created successfully');
//                 resolve();
//             })
//             .on('error', (err) => {
//                 console.error('Error creating slideshow:', err);
//                 reject(err);
//             })
//             .on('progress', (progress) => {
//                 console.log('Processing: ' + progress.percent + '% done');
//             })
//             .save(outputPath);
//     });
// };

// Helper function to combine video with audio
// const combineVideoWithAudio = async (videoPath, audioPath, outputPath) => {
//     return new Promise((resolve, reject) => {
//         ffmpeg()
//             .input(videoPath)
//             .input(audioPath)
//             .outputOptions([
//                 '-c:v copy',
//                 '-c:a aac',
//                 '-shortest', // Stop when shortest stream ends
//                 '-movflags +faststart'
//             ])
//             .on('end', () => {
//                 console.log('✅ Video and audio combined successfully');
//                 resolve();
//             })
//             .on('error', (err) => {
//                 console.error('Error combining video and audio:', err);
//                 reject(err);
//             })
//             .save(outputPath);
//     });
// };

// const combineVideoWithAudio = async (videoPath, audioPath, outputPath) => {
//     return new Promise((resolve, reject) => {

//         ffmpeg()
//             .input(videoPath)
//             .input(audioPath)
//             .outputOptions([
//                 '-c:v libx264',
//                 '-c:a aac',
//                 '-shortest',
//                 '-movflags +faststart'
//             ])
//             .on('end', () => {
//                 console.log('✅ Video, audio, and subtitles combined successfully');
//                 resolve();
//             })
//             .on('error', (err) => {
//                 console.error('Error combining video, audio, and subtitles:', err);
//                 reject(err);
//             })
//             .on('progress', (progress) => {
//                 if (progress.percent) {
//                     console.log('Processing: ' + Math.round(progress.percent) + '% done');
//                 }
//             })
//             .save(outputPath);
//     });
// };



// Helper function for cleanup
// const cleanupTempFiles = async (filePaths) => {
//     const cleanupResults = await Promise.allSettled(
//         filePaths.map(async (filePath) => {
//             try {
//                 if (fs.existsSync(filePath)) {
//                     fs.unlinkSync(filePath);
//                     console.log(`🗑️ Cleaned up: ${path.basename(filePath)}`);
//                 }
//             } catch (err) {
//                 console.warn(`Warning: Could not delete ${filePath}:`, err.message);
//             }
//         })
//     );

//     const failedCleanups = cleanupResults.filter(result => result.status === 'rejected');
//     if (failedCleanups.length > 0) {
//         console.warn(`${failedCleanups.length} files could not be cleaned up`);
//     }
// };

// Add after your other helper functions
// Enhanced function to split long text intelligently
// const splitTextIntoChunks = (text, maxCharsPerChunk = 80) => {
//     // If text is short enough, return as single chunk
//     if (text.length <= maxCharsPerChunk) {
//         return [text];
//     }

//     const chunks = [];
//     const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
//     let currentChunk = '';
    
//     for (let sentence of sentences) {
//         sentence = sentence.trim();
        
//         // If adding this sentence exceeds max, save current chunk and start new one
//         if ((currentChunk + sentence).length > maxCharsPerChunk) {
//             if (currentChunk) {
//                 chunks.push(currentChunk.trim());
//                 currentChunk = sentence + ' ';
//             } else {
//                 // Single sentence is too long, split by comma or space
//                 const parts = sentence.split(/,|\band\b|\bor\b/);
//                 for (let part of parts) {
//                     part = part.trim();
//                     if ((currentChunk + part).length > maxCharsPerChunk) {
//                         if (currentChunk) chunks.push(currentChunk.trim());
//                         // If still too long, split by words
//                         if (part.length > maxCharsPerChunk) {
//                             const words = part.split(' ');
//                             currentChunk = '';
//                             for (let word of words) {
//                                 if ((currentChunk + word).length > maxCharsPerChunk) {
//                                     chunks.push(currentChunk.trim());
//                                     currentChunk = word + ' ';
//                                 } else {
//                                     currentChunk += word + ' ';
//                                 }
//                             }
//                         } else {
//                             currentChunk = part + ' ';
//                         }
//                     } else {
//                         currentChunk += part + ', ';
//                     }
//                 }
//             }
//         } else {
//             currentChunk += sentence + ' ';
//         }
//     }
    
//     // Add remaining chunk
//     if (currentChunk.trim()) {
//         chunks.push(currentChunk.trim());
//     }
    
//     return chunks.filter(chunk => chunk.length > 0);
// };

// Updated generateSRTFile function with automatic splitting
// const generateSRTFile = (narrations) => {
//     let srtContent = '';
//     let subtitleIndex = 1;
//     let currentTime = 0;
    
//     const MAX_CHARS_PER_SUBTITLE = 80; // 2 lines × ~40 chars
//     const MAX_DURATION_PER_SUBTITLE = 6; // Maximum 6 seconds per subtitle
    
//     const formatTime = (seconds) => {
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = Math.floor(seconds % 60);
//         const milliseconds = Math.floor((seconds % 1) * 1000);
        
//         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
//     };
    
//     narrations.forEach((narration) => {
//         const text = narration.narration;
//         const totalDuration = narration.duration;
        
//         // Split text into chunks if it's too long
//         const textChunks = splitTextIntoChunks(text, MAX_CHARS_PER_SUBTITLE);
        
//         // Calculate duration for each chunk
//         const chunkDuration = totalDuration / textChunks.length;
        
//         // If individual chunk duration exceeds max, use max duration
//         const actualChunkDuration = Math.min(chunkDuration, MAX_DURATION_PER_SUBTITLE);
        
//         textChunks.forEach((chunk) => {
//             const startTime = currentTime;
//             const endTime = currentTime + actualChunkDuration;
            
//             // SRT format
//             srtContent += `${subtitleIndex}\n`;
//             srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
//             srtContent += `${chunk}\n\n`;
            
//             subtitleIndex++;
//             currentTime = endTime;
//         });
//     });
    
//     // Save SRT file
//     const srtPath = path.join(OUTPUT_DIR, `subtitles_${Date.now()}.srt`);
//     fs.writeFileSync(srtPath, srtContent, 'utf8');
    
//     console.log(`✅ SRT file generated with ${subtitleIndex - 1} subtitle segments: ${srtPath}`);
//     return srtPath;
// };




