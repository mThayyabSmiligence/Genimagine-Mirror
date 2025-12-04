const AiLearningQueue = require("../queue/AILearningQueue");
const { extractTextFromPDF } = require("../service/ai-Learning-POC/specExtractor");
const { getAiLearningByUserIdService } = require("../service/ai-learning/spec/specGet.service");
const { creatNewAiLearning_Tech_Full } = require("../service/ai-learning/spec/specUpload.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

exports.createAiLearningController= asyncHandler( async(req,res)=>{
    
    if(!req.file){
       throw new AppError("pdf required",400)
    }
    const file = req.file;

    const {title} = req.body;
    const user_id = req.user.id

    if(!title){
        throw new AppError("title required",400)
    }

    // const spec= null;

    const spec = await creatNewAiLearning_Tech_Full(title,file,user_id);

    
    
    res.status(200).json(spec)
})

exports.getAiLearningByUserIdController= asyncHandler( async(req,res)=>{
    const user_id = req.user.id
    const spec = await getAiLearningByUserIdService(user_id);
    res.status(200).json({success:true,spec})
})