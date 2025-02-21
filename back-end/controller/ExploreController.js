
const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const { getAllExploreImagesService, getExploreImageByIdService, ViewExploreImageService, LikeExploreImageService, UnlikeExploreImageService, getExploreImageByUserIdService, publishToExploreService, getExploreImagesService } = require("../service/ExploreService");

exports.publishToExploreController=async(req,res)=>{
    const {image_id,image_path,caption}= req.body;
    const {id}=req.user;

    let cookies =null
    let token =null 
    let decodeToken=null
            
    try{
        const cookies1 = cookie.parse(req.headers.cookie)
        cookies=cookies1    
        const token1 = cookies.token
        token= token1
        decodeToken= jwt.decode(token)
    }catch(err){
        console.log(err)    
        return res.status(401).json({
            message:"unauthorized"
        })
    }
    console.log("image id:",image_id,",image_path:",image_path,",catption:",caption?caption:"",",token:",token,"user_id:",id)
    const response=await publishToExploreService(image_id, image_path,caption,token,id)

    console.log(response.status)
    return res.status(response.status).json(response)  
    
    
}

exports.getAllExploreImagesController=async(req,res)=>{
    try {
        const { sort, time, page ,user_id} = req.query;

        const response = await getExploreImagesService({ sort, time, page,user_id});

        res.status(response.status).json(response);
    }catch (err) {
        console.error("Error in explore API:", err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}
exports.getExploreImageByIdController=async (req,res)=>{
    const {published_id}=req.params;
    
    const exploreImage= await getExploreImageByIdService(published_id);
    
    return res.status(exploreImage.status).json(exploreImage);

}

exports.getExploreImageByUserIdController=async(req,res)=>{

    const exploreImages= await getExploreImageByUserIdService(req.user.id);
    
    return res.status(exploreImages.status).json(exploreImages);
 
}

exports.ViewExploreImageController=async(req,res)=>{
    //logic to view explore image
    const {published_id}=req.params;
    const response =await ViewExploreImageService(published_id)
    
    return res.status(response.status).json(response)  ;
 
}

exports.LikeExploreImageController = async(req, res) => {
    const {published_id}=req.params;
    const {id}=req.user;
    
    const result = await LikeExploreImageService(published_id,id);
    
    return res.status(result.status).json(result);
}

exports.UnlikeExploreImageController=async(req,res)=>{
    const {published_id}=req.params;
    const {id}=req.user;
    
    const result = await UnlikeExploreImageService(published_id);
    
    return res.status(result.status).json(result);  
}