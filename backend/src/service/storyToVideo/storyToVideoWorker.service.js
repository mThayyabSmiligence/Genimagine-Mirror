const path = require("path");
const fs = require('fs');
const { Scene, StoryToVideo } = require("../../models");
const AppError = require("../../utils/AppError");
const StoryToVideoError = require("../../utils/StoryToVideoError");
const { uploadStoryToVideo, uploadSubtitles } = require("../S3Service");

const { generateAndCombineAudioForNarrations, generateAndCombineVideoForNarrations } = require("./audioVideo.service");
const { nrrativizeTheDescription } = require("./narration.service");
const { generateMultiLanguageSubtitles } = require("./subtitle.service");


const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const TEMP_IMAGES_DIR = path.join(ROOT_DIR, 'assets/temp/images');
const OUTPUT_DIR = path.normalize(path.join(ROOT_DIR, 'assets/output'));


if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_IMAGES_DIR)) fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });



const startStoryToVideoWorker = async (storyToVideoId) => {

    let storyToVideo = null;
    try{
        console.log("test1");
        storyToVideo = await StoryToVideo.findOne({ where: { id: storyToVideoId } });
        if (!storyToVideo) {
            throw new AppError('StoryToVideo not found', 404)
        }

        storyToVideo.status="in-progress";
        await storyToVideo.save();

        console.log("test1");
        
        const scenes = await Scene.findAll({ where: { story_id: storyToVideo.story_id } });
        
        if(scenes === null||scenes.length === 0){
            throw new StoryToVideoError('No scenes found for this story', 404,storyToVideoId)
        };

        let narrations = await nrrativizeTheDescription(scenes,storyToVideoId,storyToVideo.language);
        console.log("test1");

        if(narrations === null||narrations.length === 0){
            throw new StoryToVideoError('No narrations found for this story', 404,storyToVideoId)
        };

        const requiredNarrationFormat = narrations.scenesWithNarrations.every(scene => {
            const narration = scene.narration;
            return narration !== null && typeof narration === 'string' && 'scene_order' in scene && 'id' in scene && 'image_url' in scene;
        });
        if(!requiredNarrationFormat){
            throw new StoryToVideoError('Narrations are not in the required format', 400, storyToVideoId)
        }

        storyToVideo.narrations=narrations.narrations; 
        storyToVideo.status="generating-audio";
        await storyToVideo.save();


        const audioObject = await generateAndCombineAudioForNarrations(narrations.scenesWithNarrations,storyToVideoId,storyToVideo.language);
        console.log("test1");


        if(audioObject.success === false){
            throw new StoryToVideoError('Failed to generate audio', 500,storyToVideoId)
        };

        console.log(audioObject);
        narrations = audioObject.narrations
        console.log("test1");

        storyToVideo.status="generating-subtitles";
        await storyToVideo.save();

        console.log("🌐 Generating multi-language subtitles...");
        const targetLanguages = ['en', 'es', 'hi', 'fr', 'de', 'ja', 'zh-cn', 'pt', 'ar', 'ta', 'te'];
        
        const subtitleFiles = await generateMultiLanguageSubtitles(
            narrations,
            storyToVideoId,
            storyToVideo.language,
            targetLanguages
        );

        console.log(`✅ Generated ${subtitleFiles.length} subtitle files`);

        // Store subtitle paths temporarily (you'll upload to S3 and store URLs)
        const subtitlePathsForUpload = subtitleFiles.map(sf => ({
            language: sf.language,
            label: sf.label,
            localPath: sf.srtPath
        }));

        const uploadedSubtitles = await uploadSubtitles(subtitlePathsForUpload, storyToVideoId);


        storyToVideo.subtitles = uploadedSubtitles;
        storyToVideo.status="generating-video";
        await storyToVideo.save();

        const videoObject = await generateAndCombineVideoForNarrations(audioObject.combinedAudioPath, narrations, audioObject.totalDuration,storyToVideoId);

        console.log("test1");

        if(videoObject.success === false){
            storyToVideo.status="failed";
            storyToVideo.error_message="Failed to generate video";
            await storyToVideo.save();
            throw new AppError('Failed to generate video ', 500)
        };

        let video_upload;
        try{
            const video = fs.readFileSync(videoObject.videoPath);
            video_upload = await uploadStoryToVideo(video,storyToVideo.story_id,storyToVideo.id);
            fs.unlinkSync(videoObject.videoPath);
        }catch(error){
            console.log(error);
            storyToVideo.status="failed";
            storyToVideo.error_message="Failed to upload video";
            await storyToVideo.save();
            throw new AppError('Failed to upload video ', 500)
        }
        storyToVideo.video_url = video_upload.fileUrl;
        storyToVideo.video_path = video_upload.path;
        storyToVideo.status="done";
        await storyToVideo.save();

    }catch(error){
        console.error("Unhandled error in worker:", error);
        if (storyToVideo) {
        storyToVideo.status = "failed";
        storyToVideo.error_message = error.message || "Unknown error";
        await storyToVideo.save();
        }
        throw new StoryToVideoError('Worker failed unexpectedly', 500, storyToVideoId);
    }
    
};

module.exports = { startStoryToVideoWorker };