require("dotenv").config({ path: require("path").resolve(__dirname, "../config.env") });
const { Worker } = require("bullmq");


module.exports = (connection) =>{
    const worker = new Worker("storyToVideoQueue", async job => {
        const { storyId } = job.data;
        console.log(`Processing video for story: ${storyId}`);
    }, { connection, concurrency: 1 });
}