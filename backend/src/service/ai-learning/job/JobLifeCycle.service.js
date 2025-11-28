const { AiLearningJob } = require("../../../models");
const AiLearningQueue = require("../../../queue/AILearningQueue");
const AppError = require("../../../utils/AppError")

const createNewAiLearningQueue=async(user_id,spec_id,job_type="full_learning")=>{
    try{
        // throw err;
        const job= await AiLearningJob.create({spec_id,user_id,job_type});
        console.log("job created:",job.id);
        const queue = await AiLearningQueue.add("AiLearningQueue", { id:spec_id,userId:user_id,trackingId:job.id });
        return job
    }
    catch(err){
        throw new AppError(err.message||"Something went wrong with creating new ai learning job", 500)
    }
}

const updateJobStatus = async ({ job_id, status, error_message = null }) => {
    try {
        //validatons
        if (!job_id) {
            throw new Error("Job ID is required.");
        }
        if (!status) {
            throw new Error("Status is required.");
        }

        const updatePayload = { status };
        if (error_message != null) {
            updatePayload.error_message = error_message;
        }


        const job = await AiLearningJob.update(updatePayload, { where: { id: job_id } });
        return job;
    }
    catch(err){
        throw new AppError(err.message||"Something went wrong with updating ai learning job status", 500)
    }
};

module.exports = { createNewAiLearningQueue , updateJobStatus }
