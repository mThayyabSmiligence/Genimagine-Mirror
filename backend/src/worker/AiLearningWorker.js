require("dotenv").config({ path: require("path").resolve(__dirname, "../config.env") });
const { Worker } = require("bullmq");
const { updateJobStatus } = require("../service/ai-learning/job/JobLifeCycle.service");
const { startAiLearningWorker } = require("../service/ai-learning/AiLearningWorker.service");


module.exports = (connection)=>{
    //required fields
    //id => ai_learning.specs.id
    //userId => users.user_id
    //tracking id => ai_learning.jobs.id
    const worker= new Worker("AiLearningQueue", async job => {
        const { id, userId, trackingId } = job.data;
        if (!id || !userId || !trackingId) {
            throw new Error(`One of the required fields is missing: id=${id}, userId=${userId}, trackingId=${trackingId}`);
        } 

        await startAiLearningWorker(id, userId, trackingId);
        
        console.log(`Processing AiLearning: ${id}`);
    }, { connection, concurrency: 1 });

    worker.on("completed", async job => {
        console.log(`Job ${job.id} completed`);
        try{
            await updateJobStatus({ job_id: job.data.trackingId, status: "COMPLETED" });
        }
        catch(err){
            console.log(err);
        }
    });

    worker.on("failed",async job => {
        console.log(`Job ${job.id} failed`);
        try{
            await updateJobStatus({ job_id: job.data.trackingId, status: "FAILED", error_message: job.failedReason || null });
        }
        catch(err){
            console.log(err);
        }
    });
}
