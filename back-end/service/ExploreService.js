const db = require('../config/connectDatabase');
const axios =require('axios');
const { uploadImageToExplore } = require('./UploadToServerService');
exports.publishToExploreService=async(image_id,image_path,caption,token,user_id)=>{
    let image_data;
    let published_id;

    try{
        const response = await uploadImageToExplore(user_id,image_path,token)
        if(response.status!= 200){
            return response
        }
        image_data=response

    }catch( err){
        return{
            status:500,
            message:"internal server error",
            success:false
        }
    }
    try{
        const query ="INSERT INTO Explore (user_id, caption, image_id, image_url, image_path) VALUES (?, ?, ?, ?, ?)"
        const [rows] = await db.execute(query,[user_id,caption, image_id,image_data.imageUrl,image_data.imagePath])
        if (rows.affectedRows == 0) {
             return {
                status:400,
                message:"Error publishing image",
                success:false
            }
        }
        published_id = rows.insertId;
    }catch( err){
        console.error("error inserting image into explore",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }

    try{
        const query ="INSERT INTO ExploreMetrics (published_id, likes_count, views_count, ranking_score) VALUES (?, ?, ?, ?)"
        const [rows] = await db.execute(query,[published_id,0,0,0])
        if (rows.affectedRows == 0) {
             return {
                status:400,
                message:"Error publishing image",
                success:false
            }
        }
        console.log("Image published successfully!");
        return {
            status:200,
            message:"image is successfully published",
            success:true,
            explore_id: published_id
        }
    }catch( err){
        console.error("error inserting image into explore",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }

}


exports.getAllExploreImagesService=async()=>{
    try{
        const query ="SELECT * FROM Explore"
        const [rows] = await db.execute(query)
        if (rows.length == 0) {
             return {
                status:404,
                message:"No images found",
                success:false
            }
        }
        return {
            status:200,
            message:"images found successfully",
            success:true,
            images:rows
        }
    }catch( err){
        console.error("error fetching images",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }
}

exports.getExploreImageByIdService=async(explore_id)=>{
    try{
        const query ="SELECT * FROM Explore WHERE published_id =?"
        const [rows] = await db.execute(query,[explore_id])
        if (rows.length == 0) {
             return {
                status:404,
                message:"No image found with given id",
                success:false
            }
        }
        return {
            status:200,
            message:"image found successfully",
            success:true,
            image:rows[0]
        }
    }catch( err){
        console.error("error fetching image",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }
}
exports.getExploreImageByUserIdService=async(user_id)=>{
    try{
        const query ="SELECT * FROM Explore WHERE user_id =?"
        const [rows] = await db.execute(query,[user_id])
        if (rows.length == 0) {
             return {
                status:404,
                message:"No images found by given user",
                success:false
            }
        }
        return {
            status:200,
            message:"images found successfully",
            success:true,
            images:rows
        }
    }catch( err){
        console.error("error fetching images",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }
}

exports.ViewExploreImageService=async(published_id)=>{
    try{
        const query ="UPDATE ExploreMetrics SET views_count = views_count + 1 WHERE published_id =?"
        const [rows] = await db.execute(query,[published_id])
        console.log("View count for image is updated")
        return{
            status:200,
            message:"view count updated successfully",
            success:true
        }
    }catch(err){
        console.error("error updating view count",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }
}
exports.LikeExploreImageService=async(published_id)=>{
    try{
        const query ="UPDATE ExploreMetrics SET likes_count = likes_count + 1 WHERE published_id =?"
        const [rows] = await db.execute(query,[published_id])
        console.log("Like count for image is updated")
        return{
            status:200,
            message:"like count updated successfully",
            success:true
        }
    }catch(err){
        console.error("error updating like count",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }
}
exports.UnlikeExploreImageService=async(published_id)=>{
    try{
        const query ="UPDATE ExploreMetrics SET likes_count = likes_count - 1 WHERE published_id =?"
        const [rows] = await db.execute(query,[published_id])
        console.log("Like count for image is updated")
        return{
            status:200,
            message:"like count updated successfully",
            success:true
        }
    }catch(err){
        console.error("error updating like count",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }
}