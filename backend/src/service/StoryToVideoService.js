const { llama3BInstructText } = require("../API/CloudFlare.api");
const { extractValidJson } = require("../helper/JsonHelper");
const { Scene, StoryToVideo, Story } = require("../models");
const AppError = require("../utils/AppError");
const path = require("path");
const gTTS = require('gtts');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { getAudioDurationInSeconds } = require('get-audio-duration');
const { uploadStoryToVideo } = require("./S3Service");
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const StoryToVideoError = require("../utils/StoryToVideoError");




const ROOT_DIR = path.join(__dirname, '..'); // go up one level
const AUDIO_DIR = path.join(ROOT_DIR, 'assets/temp/audio');
const TEMP_IMAGES_DIR = path.join(ROOT_DIR, 'assets/temp/images');
const OUTPUT_DIR = path.join(ROOT_DIR, 'assets/output');

if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(TEMP_IMAGES_DIR)) fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });



exports.createStoryToVideoService = async (userId, storyId) => {
    
    const storyToVideoCheck = await StoryToVideo.findOne({ where: { story_id: storyId, user_id: userId } });

    if (storyToVideoCheck && storyToVideoCheck.status == "failed") {
        await StoryToVideo.destroy({ where: { story_id: storyId } });
    }
    else if (storyToVideoCheck) {
        throw new AppError('StoryToVideo already exists', 409)
    };

    const Scenes= await Scene.findAll({ where: { user_id: userId, story_id: storyId } });

    if(Scenes === null||Scenes.length === 0){
        throw new AppError('No scenes found for this story', 404)
    };
    
       
    try {
        const storyToVideo = await StoryToVideo.create(
            {
            story_id: storyId,
            user_id: userId
            }
        );


        return storyToVideo
    } catch (error) {
        console.error("Error creating storyToVideo:", error);
        throw new AppError('Failed to create storyToVideo', 500)
    }  
   
};


exports.startStoryToVideoWorker = async (storyToVideoId) => {

    let storyToVideo = null;
    try{
        console.log("test1");
        storyToVideo = await StoryToVideo.findByPk(storyToVideoId);
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

        let narrations = await this.nrrativizeTheDescription(scenes,storyToVideoId);
        console.log("test1");

        if(narrations === null||narrations.length === 0){
            storyToVideo.status="failed";
            storyToVideo.error_message="No narrations found for this story";
            await storyToVideo.save();
            throw new AppError('No narrations found for this story', 404)
        };

        storyToVideo.status="generating-audio";
        await storyToVideo.save();


        const audioObject = await this.generateAndCombineAudioForNarrations(narrations.scenesWithNarrations,storyToVideoId);
        console.log("test1");


        if(audioObject.success === false){
            storyToVideo.status="failed";
            storyToVideo.error_message="Failed to generate audio";
            await storyToVideo.save();
            throw new AppError('Failed to generate audio ', 500)
        };

        console.log(audioObject);
        narrations = audioObject.narrations
        console.log("test1");

        storyToVideo.status="generating-video";
        await storyToVideo.save();

        const videoObject = await this.generateAndCombineVideoForNarrations(audioObject.combinedAudioPath, narrations, audioObject.totalDuration,storyToVideoId);

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

exports.nrrativizeTheDescription = async (scenes,storyToVideoId) => {

  console.log("narrations is starting");
    // This will return an array of objects, each with a scene_order and description property:
    // Example: [{scene_order: 1, description: "Scene 1 description"}, {scene_order: 2, description: "Scene 2 description"}]
    const input = scenes.map((scene) => ({scene_order: scene.scene_order, description: scene.prompt}));

    const systemPrompt ="You convert scene descriptions to short, engaging narratives for video narration in a json format with the following structure: [{scene_order: number, narration: string}]."
    const message=[
        {
            role: "system",
            content: systemPrompt
        },
        {
            role: "user",
            content: JSON.stringify(input)
        }
    ]

    const response = await llama3BInstructText(message,2000);
    let narrations = extractValidJson(response)
    console.log("narations : ",narrations)
    let scenesWithNarrations=[];
    try{
     scenesWithNarrations = scenes.map((scene, index) => {
        const narration = narrations.find(n => n.scene_order === scene.scene_order);
        if (narration) {
          return {
            id: scene.id,
            image_url: scene.image_url,
            scene_order: scene.scene_order,
            narration: narration.narration
          }
        } else {
          return null;
        }
      }).filter(s => s !== null);
    } catch (error) {

        console.error("Error creating storyToVideo:", error);
        throw new StoryToVideoError('Failed to generate narrations', 500,storyToVideoId)
        
    }



    console.log("scenesWithNarrations : ",scenesWithNarrations)
    return {
        narrations,
        scenesWithNarrations
    }
    
};
exports.generateAndCombineAudioForNarrations = async (narrations,storyToVideoId) => {
    try {
        console.log("generateAndCombineAudioForNarrations is starting");
        const narrationsWithDuration = [];

        // Step 1: Generate individual audio files and store filename in object
        await Promise.all(
            narrations.map(async (narration, index) => {
                return new Promise(async (resolve, reject) => {
                    const randomNumber = Math.floor(100000 + Math.random() * 900000);
                    const audioPath = path.join(AUDIO_DIR, `temp_audio_${randomNumber}.mp3`);
                    const gtts = new gTTS(narration.narration, 'en');

                    gtts.save(audioPath, async (err) => {
                        if (err) {
                            console.error("Error saving audio:", err);
                            reject(err);
                        } else {
                            try {
                                const duration = await getAudioDurationInSeconds(audioPath);
                                
                                // Store everything including filename in the object
                                narrationsWithDuration[index] = {
                                    ...narration,
                                    duration: duration,
                                    audioFile: audioPath  // Store filename here!
                                };

                                console.log(`✅ Audio generated: ${audioPath}, Duration: ${duration}s`);
                                resolve(audioPath);
                            } catch (durationError) {
                                console.error("Error getting duration:", durationError);
                                reject(durationError);
                            }
                        }
                    });
                });
            })
        );

        // Step 2: Combine audio files in order (narrations array is already ordered!)
        const combinedAudioPath = path.join(AUDIO_DIR, `combined_audio_${Date.now()}.mp3`);

        await new Promise((resolve, reject) => {
            let command = ffmpeg();

            // Add files in the correct order from the narrations array
            narrationsWithDuration.forEach(narration => {
                command = command.input(narration.audioFile);
            });

            command
                .complexFilter([
                    narrationsWithDuration.map((_, i) => `[${i}:a]`).join('') +
                    `concat=n=${narrationsWithDuration.length}:v=0:a=1[outa]`
                ])
                .outputOptions(['-map', '[outa]'])
                .save(combinedAudioPath)
                .on('end', () => {
                    console.log('✅ Audio files combined successfully');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Error combining audio files:', err);
                    reject(err);
                });
        });

        // Step 3: Clean up temporary files
        narrationsWithDuration.forEach(narration => {
            try {
                fs.unlinkSync(narration.audioFile);
            } catch (err) {
                console.warn(`Warning: Could not delete temp file ${narration.audioFile}:`, err.message);
            }
        });

        return {
            combinedAudioPath,
            narrations: narrationsWithDuration,
            totalDuration: narrationsWithDuration.reduce((sum, n) => sum + n.duration, 0),
            success: true
        };

    } catch (error) {
        console.error("Error generating and combining audio:", error);
        throw new StoryToVideoError('Failed to create narration audio', 500,storyToVideoId)
    }
};


// Replace your empty function with this complete implementation:
exports.generateAndCombineVideoForNarrations = async (combinedAudioPath, narrations, totalDuration, storyToVideoId) => {
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

// Function to download image from AWS S3 URL
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

// Helper function to create slideshow with custom durations for each image
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

// Helper function to combine video with audio
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

// Helper function for cleanup
const cleanupTempFiles = async (filePaths) => {
    const cleanupResults = await Promise.allSettled(
        filePaths.map(async (filePath) => {
            try {
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath);
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



exports.getStoryToVideoByStoryIdService = async (storyId, userId) => {
    const storyToVideo = await StoryToVideo.findOne({ where: { story_id: storyId } });
    if (!storyToVideo || storyToVideo.user_id !== userId) {
        throw new AppError('StoryToVideo not found', 404)
    }
    return storyToVideo;
};

