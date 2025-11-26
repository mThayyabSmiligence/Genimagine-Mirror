const { createAiLearingPocService } = require("../service/ai-Learning-POC/AiLearingPocService");
const { extractTextFromPDF } = require("../service/ai-Learning-POC/specExtractor");
const AppError = require("../utils/AppError")
const asyncHandler = require("../utils/asyncHandler")

exports.createAiLearingPocController= asyncHandler( async(req,res)=>{
    if(!req.file){
       throw new AppError("pdf required",400)
    }
    console.log(req.file);

    const file = req.file;
    const pdfBuffer = file.buffer;
    const service = await createAiLearingPocService(pdfBuffer);
    
    res.status(200).json({success:true,modules:service.modules})
})