require("dotenv").config({ path: require("path").resolve(__dirname, "../config.env") });
const { Worker } = require("bullmq");
const { startStoryToVideoWorker } = require("../service/StoryToVideoService");


module.exports = (connection) =>{
    const worker = new Worker("storyToVideoQueue", async job => {
        const { id ,userId} = job.data; 

        console.log(`Processing storyToVideo: ${id}`);

        const result = await startStoryToVideoWorker(id); 

        
    }, { connection, concurrency: 1 });

    worker.on("completed", job => {
        console.log(`Job ${job.id} completed`);
    });

    worker.on("failed", job => {
        console.log(`Job ${job.id} failed`);
    });
}