const path = require("path");
const fs = require('fs');
const { Scene, StoryToVideo } = require("../../models");
const AppError = require("../../utils/AppError");
const StoryToVideoError = require("../../utils/StoryToVideoError");
const { uploadStoryToVideo, uploadSubtitles, uploadAudioTrack } = require("../S3Service");

const { generateAndCombineAudioForNarrations,  generateVideoForNarrations } = require("./audioVideo.service");
const { nrrativizeTheDescription } = require("./narration.service");
const { generateMultiLanguageSubtitles, translateNarrationsToLanguage } = require("./subtitle.service");
const { generateSRTFile, generateSRTFileForLanguage } = require("../../helper/text.helper");
const { type } = require("os");
const { Json } = require("sequelize/lib/utils");
const { safeJsonParse } = require("../../helper/JsonHelper");
const { cleanupTempFiles } = require("../../helper/file.helper");


const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const TEMP_IMAGES_DIR = path.join(ROOT_DIR, 'assets/temp/images');
const OUTPUT_DIR = path.normalize(path.join(ROOT_DIR, 'assets/output'));


if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_IMAGES_DIR)) fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });



const startStoryToVideoWorker = async (storyToVideoId,language) => {


    let storyToVideo = null;

    try{

        //1. get the storyToVideo
        console.log("test1");
        storyToVideo = await StoryToVideo.findOne({ where: { id: storyToVideoId } });
        if (!storyToVideo) {
            throw new AppError('StoryToVideo not found', 404)
        }

        //2. update the status
        storyToVideo.status="in-progress";
        await storyToVideo.save();

        
        //3. get the scenes
        const scenes = await Scene.findAll({ where: { story_id: storyToVideo.story_id } });
        
        if(scenes === null||scenes.length === 0){
            throw new StoryToVideoError('No scenes found for this story', 404,storyToVideoId)
        };

        //4. narrations
        let narrations = await nrrativizeTheDescription(scenes,storyToVideoId,language,[],true);

        if(narrations === null||narrations.length === 0||narrations.success === false){
            throw new StoryToVideoError('No narrations found for this story', 404,storyToVideoId)
        };

        const requiredNarrationFormat = narrations.scenesWithNarrations.every(scene => {
            const narration = scene.narration;
            return narration !== null && typeof narration === 'string' && 'scene_order' in scene && 'id' in scene && 'image_url' in scene;
        });
        if(!requiredNarrationFormat){
            throw new StoryToVideoError('Narrations are not in the required format', 400, storyToVideoId)
        }

        //5. update the narrations
        storyToVideo.narrations=narrations.narrations; 
        storyToVideo.status="generating-audio";
        await storyToVideo.save();

        
        //6. generate audio
        const audioObject = await generateAndCombineAudioForNarrations(narrations.scenesWithNarrations,storyToVideoId,storyToVideo.language,[],true);

        if(audioObject.success === false){
            throw new StoryToVideoError('Failed to generate audio', 500,storyToVideoId)
        };
        console.log("🌐 audioObject",audioObject);
        narrations = audioObject.narrations

        const scene_timings = narrations.map(scene => {
            return{
                scene_order: scene.scene_order,
                duration: scene.duration
            }
        });
        const audio = fs.readFileSync(audioObject.combinedAudioPath);
        const audioUpload= await uploadAudioTrack(audio,storyToVideoId,language);

        if(audioUpload.success === false){
            throw new StoryToVideoError('Failed to upload audio track', 500,storyToVideoId)
        };
        
        const audio_tracks = [
            {
                language: language,
                url: audioUpload.fileUrl,
                path: audioUpload.path,
                type: 'primary',
                status:"done"
            }
        ];

        //7. update the scene timings
        storyToVideo.scene_timings = scene_timings;
        storyToVideo.audio_tracks = audio_tracks;
        storyToVideo.status="generating-subtitles";
        await storyToVideo.save();
        // throw new StoryToVideoError('Failed to generate audio', 500,storyToVideoId)
        
        console.log("🌐 Generating multi-language subtitles...");

        const srtPath= await generateSRTFileForLanguage(narrations,language,storyToVideoId);
        const uploadedSubtitles = await uploadSubtitles(srtPath,storyToVideoId,language);
     

        storyToVideo.subtitle_tracks = [
            {
                language: language,
                url: uploadedSubtitles.fileUrl,
                path: uploadedSubtitles.path,
                type: 'primary'
            }
        ];
        storyToVideo.status="generating-video";
        await storyToVideo.save();


        const videoObject = await generateVideoForNarrations( narrations, audioObject.totalDuration,storyToVideoId);

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

        await cleanupTempFiles([audioObject.combinedAudioPath,srtPath]);

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

const startAddLanguageStoryToVideoWorker = async (storyToVideoId,language) => {

    try{
        console.log("startAddLanguageStoryToVideoWorker is starting");
        const storyToVideo = await StoryToVideo.findOne({ where: { id: storyToVideoId } });
        if(!storyToVideo){
            throw new StoryToVideoError('StoryToVideo not found', 404,storyToVideoId)
        }

        console.log("startAddLanguageStoryToVideoWorker is starting2");
        let narrations = safeJsonParse(storyToVideo.narrations,storyToVideo.narrations);
        const englishNarrations =narrations.find((narration) => narration.language === 'en');
        if(englishNarrations.narrations.length === 0){
            console.log("error fetching english narrations");
            throw new AppError('No english narrations found', 404)
        };
        const translatedNarrations=await translateNarrationsToLanguage(englishNarrations.narrations,language,storyToVideoId);

        
        if(translatedNarrations.success === false){
            const failedNarration={
                language:language,
                narrations:null,
                status:"failed"
            }
            narrations.push(failedNarration);
            storyToVideo.narrations=narrations;
            await storyToVideo.save();
            throw new AppError('Failed to translate narrations', 500)
        };

        console.log({
            language:language,
            narrations:translatedNarrations.narrations,
            status:"done"
        });
        narrations.push({
            language:language,
            narrations:translatedNarrations.narrations,
            status:"done"
        })
        storyToVideo.narrations=narrations;
        await storyToVideo.save();

        console.log("startAddLanguageStoryToVideoWorker is starting3");
        const audioObject = await generateAndCombineAudioForNarrations(translatedNarrations.narrations,storyToVideoId,language,safeJsonParse(storyToVideo.scene_timings,storyToVideo.scene_timings),false);

        if(audioObject.success === false){
            const failedAudioTrack={
                language:language,
                narrations:null,
                status:"failed"
            
            }
            let audio_tracks= safeJsonParse(storyToVideo.audio_tracks,storyToVideo.audio_tracks);

            audio_tracks.push(failedAudioTrack);
            storyToVideo.adio_tracks=audio_tracks;
            await storyToVideo.save();
            throw new AppError('Failed to generate audio', 500)
        };
        console.log("audioObject:- ",audioObject);
        narrations = audioObject.narrations;
        const audio = fs.readFileSync(audioObject.combinedAudioPath);
        const audioUpload= await uploadAudioTrack(audio,storyToVideoId,language);

        let new_audio_track;
        if(audioUpload.success === false){
            new_audio_track={
                language: language,
                url: null,
                path: null,
                type: 'secondary',
                status:"failed"
            }
        }
        else{
            new_audio_track={
                language: language,
                url: audioUpload.fileUrl,
                path: audioUpload.path,
                type: 'secondary',
                status:"done"
            }
        };
        

        let audio_tracks= safeJsonParse(storyToVideo.audio_tracks,storyToVideo.audio_tracks);

        
        audio_tracks=[...audio_tracks,new_audio_track];
        storyToVideo.audio_tracks=audio_tracks;
        await storyToVideo.save();


        const srtPath= await generateSRTFileForLanguage(narrations,language,storyToVideoId);
        const uploadedSubtitles = await uploadSubtitles(srtPath,storyToVideoId,language);
        console.log("uploadedSubtitles:- ",uploadedSubtitles);
        
        const new_subtitle_track={
            language: language,
            url: uploadedSubtitles.fileUrl,
            path: uploadedSubtitles.path,
            type: 'secondary',
            status:uploadedSubtitles.success?"done":"failed"
        };
        let subtitle_tracks= safeJsonParse(storyToVideo.subtitle_tracks,storyToVideo.subtitle_tracks);
        subtitle_tracks=[...subtitle_tracks,new_subtitle_track];
        storyToVideo.subtitle_tracks=subtitle_tracks;
        await storyToVideo.save();
        await cleanupTempFiles([srtPath,audioObject.combinedAudioPath]);
    }catch(error){
        console.error("Unhandled error in worker:", error);
        throw new AppError('Worker failed unexpectedly', 500);

    }
}


module.exports = { startStoryToVideoWorker,startAddLanguageStoryToVideoWorker };