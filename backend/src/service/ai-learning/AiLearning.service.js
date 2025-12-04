const { AiLearningSpec, AiLearningJob } = require("../../models");
const AiLearningQueue = require("../../queue/AILearningQueue");
const AppError = require("../../utils/AppError");
const { uploadAiLearningPdf } = require("../S3Service");

const creatNewAiLearning_Tech_Full = async (title,file,user_id ) => {
    try {
        const orginalFileName = file.originalname;
        const fileName = orginalFileName.split('.')[0];
        const fileType = orginalFileName.split('.')[1];

        const newAiLearning = await storeNewAiLearningSpec({
            title,
            user_id,
            original_name: fileName,
            mime_type: fileType
        });
        // const upload = await uploadAiLearningPdf(file,user_id,newAiLearning.id);
        // if(upload.success === false){
        //     throw new AppError(upload.error, 500)
        // }
    
        // newAiLearning.storage_url = upload.fileUrl
        // await newAiLearning.save();

        
        const job = await createNewAiLearningQueue(user_id,newAiLearning.id);


        return {
            spec: newAiLearning,
            job,
            success: true   
        }
    }
    catch (err) {
        throw new AppError(err.message, err.statusCode || 500)
    }
}

const storeNewAiLearningSpec = async (spec) => {
    try {
        const newAiLearning = await AiLearningSpec.create(spec);
        return newAiLearning
    }
    catch (err) {
         throw new AppError(err.message||"Something went wrong with creating new ai learning spec", 500)
    }
}

const createNewAiLearningQueue=async(user_id,spec_id,job_type="full_learning")=>{
    try{
        // throw err;
        const queue = await AiLearningQueue.add("AiLearningQueue", { id:spec_id,userId:user_id });
        const job= await AiLearningJob.create({spec_id,user_id,job_type});
        return job
    }
    catch(err){
        throw new AppError(err.message||"Something went wrong with creating new ai learning job", 500)
    }
}

// module.exports = { creatNewAiLearning_Tech_Full }