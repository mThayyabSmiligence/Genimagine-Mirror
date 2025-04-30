const { handelAspectRatio, handelModel } = require("../service/UserService");


exports.checkdimension=async(req, res)=>{
    const {aspect_id,quality_level_id}=req.body;
    console.log(
        aspect_id,"dsfd",quality_level_id
    )
    await handelAspectRatio(quality_level_id,aspect_id );
    res.status(200)
}

exports.checkmodel=async(req, res)=>{
    const {model}=req.body;
    console.log(
        model,"dsfd"
    )
    await handelModel(model );
    res.status(200)
}