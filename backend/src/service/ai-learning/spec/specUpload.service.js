const { AiLearningSpec } = require("../../../models");
const AppError = require("../../../utils/AppError");
const { uploadAiLearningPdf } = require("../../S3Service");
const { createNewAiLearningQueue } = require("../job/JobLifeCycle.service");


const creatNewAiLearning_Tech_Full = async (title,file,user_id ) => {
    try {
        const orginalFileName = file.originalname;
        const fileName = orginalFileName.split('.')[0];
        const fileType = orginalFileName.split('.')[1];

        const newAiLearning = await AiLearningSpec.create({
            title,
            user_id,
            original_name: fileName,
            mime_type: fileType
        });
        const upload = await uploadAiLearningPdf(file,user_id,newAiLearning.id);
        if(upload.success === false){
            throw new AppError(upload.error, 500)
        }
    
        newAiLearning.storage_url = upload.fileUrl
        await newAiLearning.save();

        
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

module.exports={
    creatNewAiLearning_Tech_Full
}