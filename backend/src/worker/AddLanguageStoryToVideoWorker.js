require("dotenv").config({ path: require("path").resolve(__dirname, "../config.env") });
const { Worker } = require("bullmq");
const { startAddLanguageStoryToVideoWorker } = require("../service/storyToVideo/storyToVideoWorker.service");


module.exports = (connection) =>{
    const worker = new Worker("AddLanguageStoryToVideoQueue", async job => {
        const { id ,userId,language} = job.data; 

        console.log(`Processing storyToVideo: ${id}`);

        const result = await startAddLanguageStoryToVideoWorker(id,language); 

        
    }, { connection, concurrency: 1 });

    worker.on("completed", job => {
        console.log(`Job ${job.id} completed`);
    });

    worker.on("failed", job => {
        console.log(`Job ${job.id} failed`);
    });
}