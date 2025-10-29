const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const TEMP_IMAGES_DIR = path.join(ROOT_DIR, 'assets/temp/images');
const OUTPUT_DIR = path.normalize(path.join(ROOT_DIR, 'assets/output'));


if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_IMAGES_DIR)) fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });



const splitTextIntoChunks = (text, maxCharsPerChunk = 80) => {
    // If text is short enough, return as single chunk
    if (text.length <= maxCharsPerChunk) {
        return [text];
    }

    const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    
    for (let sentence of sentences) {
        sentence = sentence.trim();
        
        // If adding this sentence exceeds max, save current chunk and start new one
        if ((currentChunk + sentence).length > maxCharsPerChunk) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence + ' ';
            } else {
                // Single sentence is too long, split by comma or space
                const parts = sentence.split(/,|\band\b|\bor\b/);
                for (let part of parts) {
                    part = part.trim();
                    if ((currentChunk + part).length > maxCharsPerChunk) {
                        if (currentChunk) chunks.push(currentChunk.trim());
                        // If still too long, split by words
                        if (part.length > maxCharsPerChunk) {
                            const words = part.split(' ');
                            currentChunk = '';
                            for (let word of words) {
                                if ((currentChunk + word).length > maxCharsPerChunk) {
                                    chunks.push(currentChunk.trim());
                                    currentChunk = word + ' ';
                                } else {
                                    currentChunk += word + ' ';
                                }
                            }
                        } else {
                            currentChunk = part + ' ';
                        }
                    } else {
                        currentChunk += part + ', ';
                    }
                }
            }
        } else {
            currentChunk += sentence + ' ';
        }
    }
    
    // Add remaining chunk
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.length > 0);
};

//input:
//narrations: [{id,scene_order: 1, narration: "Scene 1 narration", image_url: "Scene 1 image url", duration: 10,originalDuration: 7, audioFile: "Scene 1 audio file path",}]
//language: string('en','es'...)
//storyToVideoId: int
const generateSRTFileForLanguage = (narrations, language, storyToVideoId) => {
    let srtContent = '';
    let subtitleIndex = 1;
    let currentTime = 0;
    console.log("narartions in generateSRTFile: ",narrations);
    const MAX_CHARS_PER_SUBTITLE = 80;
    const MAX_DURATION_PER_SUBTITLE = 6;

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
        const narrationStartTime = currentTime;

        // Split text into chunks if too long
        const textChunks = splitTextIntoChunks(text, MAX_CHARS_PER_SUBTITLE);
        const chunkDuration = totalDuration / textChunks.length;
        const actualChunkDuration = Math.min(chunkDuration, MAX_DURATION_PER_SUBTITLE);

        textChunks.forEach((chunk) => {
            const startTime = currentTime;
            const endTime = currentTime + actualChunkDuration;

            // SRT format: index, timing, text, blank line
            srtContent += `${subtitleIndex}\n`;
            srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
            srtContent += `${chunk}\n\n`;

            subtitleIndex++;
            currentTime = endTime;
        });
        currentTime= narrationStartTime + narration.duration;
    });

    // Save SRT file
    const filename = `subtitle_${language}_${storyToVideoId}_${Date.now()}.srt`;
    const srtPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(srtPath, srtContent, 'utf8');

    console.log(`💾 Generated ${language} SRT: ${filename} (${subtitleIndex - 1} segments)`);
    return srtPath;
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
            currentTime = currentTime+ narration.duration;
        });
    });
    
    // Save SRT file
    const srtPath = path.join(OUTPUT_DIR, `subtitles_${Date.now()}.srt`);
    fs.writeFileSync(srtPath, srtContent, 'utf8');
    
    console.log(`✅ SRT file generated with ${subtitleIndex - 1} subtitle segments: ${srtPath}`);
    return srtPath;
};

module.exports = { splitTextIntoChunks,generateSRTFileForLanguage , generateSRTFile };