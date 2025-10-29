const path = require("path");
const fs = require('fs');

const { getLanguageLabel } = require("../../helper/language.helper");
const { generateSRTFileForLanguage } = require("../../helper/text.helper");
const { llama3BInstructText } = require("../../API/CloudFlare.api");
const { extractValidJson } = require("../../helper/JsonHelper");
const StoryToVideoError = require("../../utils/StoryToVideoError");



const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const TEMP_IMAGES_DIR = path.join(ROOT_DIR, 'assets/temp/images');
const OUTPUT_DIR = path.normalize(path.join(ROOT_DIR, 'assets/output'));


if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_IMAGES_DIR)) fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });


const generateMultiLanguageSubtitles = async (narrations, storyToVideoId, primaryLanguage, targetLanguages) => {
    try {
        console.log("🌐 Starting multi-language subtitle generation...");
        
        // Default target languages if not provided
        if (!targetLanguages || targetLanguages.length === 0) {
            targetLanguages = ['en', 'es', 'hi', 'fr', 'de', 'ja', 'zh-cn', 'pt', 'ar', 'ta', 'te'];
        }

        const subtitleData = [];

        // Process all languages in parallel
        const results = await Promise.allSettled(
            targetLanguages.map(async (lang) => {
                try {
                    let translatedNarrations = narrations;

                    // Translate if not the primary language
                    if (lang !== primaryLanguage) {
                        console.log(`📝 Translating to ${lang}...`);
                        translatedNarrations = await translateNarrationsToLanguage(
                            narrations, 
                            lang,
                            storyToVideoId
                        );
                    } else {
                        console.log(`✅ Using original narrations for ${lang}`);
                    }

                    // Generate SRT file
                    const srtPath = generateSRTFileForLanguage(translatedNarrations, lang, storyToVideoId);

                    return {
                        language: lang,
                        label: getLanguageLabel(lang),
                        srtPath: srtPath,
                        success: true
                    };

                } catch (error) {
                    console.error(`❌ Failed to generate subtitle for ${lang}:`, error.message);
                    return {
                        language: lang,
                        label: getLanguageLabel(lang),
                        srtPath: null,
                        success: false,
                        error: error.message
                    };
                }
            })
        );

        // Process results
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.success) {
                subtitleData.push(result.value);
                console.log(`✅ ${result.value.label} subtitle generated`);
            } else {
                const lang = targetLanguages[index];
                console.warn(`⚠️ ${getLanguageLabel(lang)} subtitle failed`);
            }
        });

        console.log(`🎉 Generated ${subtitleData.length}/${targetLanguages.length} subtitle files`);

        return subtitleData;

    } catch (error) {
        console.error("❌ Error in generateMultiLanguageSubtitles:", error);
        throw new StoryToVideoError('Failed to generate multi-language subtitles', 500, storyToVideoId);
    }
};


//input:
//narrations: [{scene_order: 1, narration: "Scene 1 narration"}]

//output:
//translatedNarrations: [{scene_order: 1, narration: "Translated Scene 1 narration"}]
//storyToVideoId: int
const translateNarrationsToLanguage = async (narrations, targetLang, storyToVideoId) => {
    try {
        

        const targetLanguageName = getLanguageLabel(targetLang);

        // Prepare input for translation
        const input = narrations.map(n => ({
            scene_order: n.scene_order,
            narration: n.narration
        }));

        const systemPrompt = `You are a professional translator. Translate the narration text to ${targetLanguageName}. 
Maintain the emotional tone and context. Keep the JSON structure with scene_order intact.
Return format: [{"scene_order": number, "narration": "translated text"}]
Always return a valid JSON array even if there's only one object.`;

        const message = [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: JSON.stringify(input)
            }
        ];

        const response = await llama3BInstructText(message, 2500);
        const translatedData = extractValidJson(response);

        // Map translated narrations back to original structure with durations
        const translatedNarrations = narrations.map((original) => {
            const translated = translatedData.find(t => t.scene_order === original.scene_order);
            return {
                ...original,
                narration: translated ? translated.narration : original.narration
            };
        });

        console.log(`✅ Translated ${translatedNarrations.length} narrations to ${targetLanguageName}`);
        return {
            narrations: translatedNarrations,
            success: true
        };

    } catch (error) {
        console.error(`❌ Translation failed for ${targetLang}:`, error);
        return {
            success: false,
            error: error.message
        }
    }
};
const generateSRTFile = (narrations) => {
    let srtContent = '';
    let subtitleIndex = 1;
    let currentTime = 0;
    
    const MAX_CHARS_PER_SUBTITLE = 80; // 2 lines × ~40 chars
    const MAX_DURATION_PER_SUBTITLE = 6; // Maximum 6 seconds per subtitle
    
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
    };
    
    narrations.forEach((narration) => {
        const text = narration.narration;
        const totalDuration = narration.originalDuration;
        
        // Split text into chunks if it's too long
        const textChunks = splitTextIntoChunks(text, MAX_CHARS_PER_SUBTITLE);
        
        // Calculate duration for each chunk
        const chunkDuration = totalDuration / textChunks.length;
        
        // If individual chunk duration exceeds max, use max duration
        const actualChunkDuration = Math.min(chunkDuration, MAX_DURATION_PER_SUBTITLE);
        
        textChunks.forEach((chunk) => {
            const startTime = currentTime;
            const endTime = currentTime + actualChunkDuration;
            
            // SRT format
            srtContent += `${subtitleIndex}\n`;
            srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
            srtContent += `${chunk}\n\n`;
            
            subtitleIndex++;
            currentTime = endTime;
        });
    });
    
    // Save SRT file
    const srtPath = path.join(OUTPUT_DIR, `subtitles_${Date.now()}.srt`);
    fs.writeFileSync(srtPath, srtContent, 'utf8');
    
    console.log(`✅ SRT file generated with ${subtitleIndex - 1} subtitle segments: ${srtPath}`);
    return srtPath;
};
module.exports = {
    generateMultiLanguageSubtitles,
    translateNarrationsToLanguage
};