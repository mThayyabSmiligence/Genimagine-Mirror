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

const translateNarrationsToLanguage = async (narrations, targetLang, storyToVideoId) => {
    try {
        const languageNames = {
            'en': 'English',
            'es': 'Spanish',
            'hi': 'Hindi',
            'fr': 'French',
            'de': 'German',
            'ja': 'Japanese',
            'zh-cn': 'Simplified Chinese',
            'pt': 'Portuguese',
            'ar': 'Arabic',
            'ta': 'Tamil',
            'te': 'Telugu'
        };

        const targetLanguageName = languageNames[targetLang] || targetLang;

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
        return translatedNarrations;

    } catch (error) {
        console.error(`❌ Translation failed for ${targetLang}:`, error);
        throw new StoryToVideoError(`Failed to translate to ${targetLang}`, 500, storyToVideoId);
    }
};

module.exports = {
    generateMultiLanguageSubtitles,
    translateNarrationsToLanguage
};