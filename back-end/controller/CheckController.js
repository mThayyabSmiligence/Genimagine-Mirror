const { handelAspectRatio, handelModel } = require("../service/UserService");


exports.checkdimension=async(req, res)=>{
    const {aspect_id,quality_level_id}=req.body;
   
    await handelAspectRatio(quality_level_id,aspect_id );
    res.status(200)
}

exports.checkmodel=async(req, res)=>{
    const {model}=req.body;
    
    await handelModel(model );
    res.status(200)
}