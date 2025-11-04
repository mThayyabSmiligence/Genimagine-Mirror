const db = require('../config/connectDatabase');
const { Op } = require("sequelize");
const axios =require('axios');
const { uploadImageToExplore } = require('./UploadToServerService');
const { use } = require('../routes/Users');
const { decrypt } = require('./EncrypDecrypt');
const { VideoReport, ExploreVideo, StoryToVideo } = require('../models');

exports.publishToExploreService=async(image_id,caption,token,user_id)=>{
    let generated_image_data;
    let image_data;
    let published_id;

    try{
        const query = "SELECT * FROM generated_images WHERE image_id=?"
        const [rows]= await db.execute(query,[image_id])
        if(rows.length==0   ){
            return {
                status:404,
                message:"image not found",
                success:false
            }
        }
        generated_image_data=rows[0]

    }catch(e){
        console.error("error fetching image",e)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }
    try{
        const query ="INSERT INTO explore (user_id,prompt,model, caption,image_id, image_url, image_path,resolution,aspect_ratio,quality,style) VALUES (?, ?,?, ?, ?,?,?,?,?,?,?)"
        const [rows] = await db.execute(query,[user_id,generated_image_data.prompt,generated_image_data.model,caption,image_id,generated_image_data.image_url,generated_image_data.image_path,generated_image_data.resolution,generated_image_data.aspect_ratio,generated_image_data.quality,generated_image_data.style])

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
        const query ="INSERT INTO exploremetrics (published_id, likes_count, views_count, ranking_score) VALUES (?, ?, ?, ?)"
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


exports.getExploreImagesService = async ( sort, time, page ,user_id) => {
    try {
        let query = `
        SELECT 
            e.*, 
            em.likes_count, 
            em.views_count, 
            em.ranking_score,
            CASE 
                WHEN el.user_id IS NOT NULL THEN TRUE 
                ELSE FALSE 
            END AS isUserLiked
        FROM explore e
        JOIN exploremetrics em ON e.published_id = em.published_id
        LEFT JOIN explorelikes el ON e.published_id = el.published_id AND el.user_id = ?
    `;
        let conditions = [];
        let params = [];

        // 🟢 1️⃣ Filter by Time (Day, Week, Month, Year, All-Time)
        if (time) {
            if (time === "day") {
                conditions.push("e.published_date >= NOW() - INTERVAL 1 DAY");
            } else if (time === "week") {
                conditions.push("e.published_date >= NOW() - INTERVAL 1 WEEK");
            } else if (time === "month") {
                conditions.push("e.published_date >= NOW() - INTERVAL 1 MONTH");
            } else if (time === "year") {
                conditions.push("e.published_date >= NOW() - INTERVAL 1 YEAR");
            }
        }

        // 🔹 Apply `WHERE` only if we have conditions
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(" AND ");
        }

        // 🟢 2️⃣ Sorting (Recent or Top by Ranking)
        if (sort === "recent") {
            query += ` ORDER BY e.published_date DESC`;
        } else if (sort === "top") {
            query += ` ORDER BY em.likes_count  DESC`;
        } else {
            query += ` ORDER BY e.published_date DESC`; // Default to recent
        }

        // 🟢 3️⃣ Pagination (Lazy Loading with Fixed Limit)
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = 10; // 🔹 Fixed page size (e.g., 10 images per page)
        const offset = (pageNumber - 1) * pageSize;

        query += ` LIMIT ${pageSize} OFFSET ${offset}`; 
        params.push(Number(pageSize) ,Number(offset) );

        // 🟢 4️⃣ Execute Query

        
        const [rows] = await db.execute(query,[user_id||0]);

        if (rows.length === 0) {
            return {
                status: 404,
                message: "No images found",
                success: false,
            };
        }

        return {
            status: 200,
            message: "Images fetched successfully",
            success: true,
            images: rows,
            pagination: {
                currentPage: pageNumber,
                pageSize: pageSize, // 🔹 Always fixed
                nextPage: rows.length === pageSize ? pageNumber + 1 : null,
            },
        };
    } catch (err) {
        console.error("Error fetching explore images:", err);
        return {
            status: 500,
            message: "Internal server error",
            success: false,
        };
    }
};
// try{
//     const query ="SELECT * FROM Explore"
//     const [rows] = await db.execute(query)
//     if (rows.length == 0) {
//          return {
//             status:404,
//             message:"No images found",
//             success:false
//         }
//     }
//     return {
//         status:200,
//         message:"images found successfully",
//         success:true,
//         images:rows
//     }
// }catch( err){
//     console.error("error fetching images",err)
//     return {
//         status:500,
//         message:"internal server error",
//         success:false
//     }
// }

exports.getExploreImageByIdService=async(explore_id,user_id)=>{
    try{
        const query = 
        `
        SELECT 
        e.*, 
        em.likes_count, 
        em.views_count, 
        em.ranking_score,
        ql.resolution AS quality_resolution,
        m.name AS model_name,
        ar.ratio AS aspect_ratio_label,
        CASE 
            WHEN el.user_id IS NOT NULL THEN TRUE 
            ELSE FALSE 
        END AS isUserLiked
        FROM explore e
        JOIN exploremetrics em ON e.published_id = em.published_id
        LEFT JOIN explorelikes el ON e.published_id = el.published_id AND el.user_id = ?
        LEFT JOIN quality_levels ql ON e.quality = ql.id
        LEFT JOIN models m ON e.model = m.id
        LEFT JOIN aspect_ratios ar ON e.aspect_ratio = ar.id
        WHERE e.published_id = ?;

        `
        let [rows] = await db.execute(query,[user_id,explore_id])

        const Report_Image_query = "SELECT * FROM image_reports WHERE published_id = ?"
        const [reportImageRows] = await db.execute(Report_Image_query, [explore_id])

        if(reportImageRows.length > 0){
            const reportDetails = reportImageRows[0].report_details
            const userReport = reportDetails.find(detail => detail.user_id == user_id);

            rows[0].isUserReported = !!userReport;
        }

        if (rows.length == 0) {
             return {
                status:404,
                message:"No image found with given id",
                success:false
            }
        }

        const prompt = decrypt(rows[0].prompt)
        rows[0].prompt = prompt
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
exports.getExploreImageByUserIdService=async(sort, time, page ,user_id,limit)=>{

    try {
        let query = `
        SELECT 
            e.*, 
            em.likes_count, 
            em.views_count, 
            em.ranking_score,
            CASE 
                WHEN el.user_id IS NOT NULL THEN TRUE 
                ELSE FALSE 
            END AS isUserLiked
        FROM explore e
        JOIN exploremetrics em ON e.published_id = em.published_id
        LEFT JOIN explorelikes el ON e.published_id = el.published_id AND el.user_id = ? 
    `;
        let conditions = [];
        let params = [];

        // 🟢 1️⃣ Filter by Time (Day, Week, Month, Year, All-Time)
        if (time) {
            if (time === "day") {
                conditions.push(" e.published_date >= NOW() - INTERVAL 1 DAY ");
            } else if (time === "week") {
                conditions.push(" e.published_date >= NOW() - INTERVAL 1 WEEK ");
            } else if (time === "month") {
                conditions.push(" e.published_date >= NOW() - INTERVAL 1 MONTH ");
            } else if (time === "year") {
                conditions.push(" e.published_date >= NOW() - INTERVAL 1 YEAR ");
            }
        }
        query += ` where e.user_id = ${user_id} `

        // 🔹 Apply `WHERE` only if we have conditions
        if (conditions.length > 0) {
            query += ' AND '+conditions.join(" AND "); 
        }

        // 🟢 2️⃣ Sorting (Recent or Top by Ranking)
        if (sort === "recent") {
            query += ` ORDER BY e.published_date DESC`;
        } 
        else if(sort ==="oldest"){
            query += ` ORDER BY e.published_date ASC`;
        }
        else if (sort === "top") {
            query += ` ORDER BY em.likes_count  DESC`;
        } else {
            query += ` ORDER BY e.published_date DESC`; // Default to recent
        }

        // 🟢 3️⃣ Pagination (Lazy Loading with Fixed Limit)
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = limit || 10; // 🔹 Fixed page size (e.g., 10 images per page)
        const offset = (pageNumber - 1) * pageSize;

        query += ` LIMIT ${pageSize} OFFSET ${offset}   `;
        params.push(Number(pageSize) ,Number(offset) );

        // 🟢 4️⃣ Execute Query

        
        const [rows] = await db.execute(query,[user_id||0]);

        if (rows.length === 0) {
            return {
                status: 404,
                message: "No images found",
                success: false,
            };
        }

        return {
            status: 200,
            message: "Images fetched successfully",
            success: true,
            images: rows,
            pagination: {
                currentPage: pageNumber,
                pageSize: pageSize, // 🔹 Always fixed
                nextPage: rows.length === pageSize ? pageNumber + 1 : null,
            },
        };
    } catch (err) {
        console.error("Error fetching explore images:", err);
        return {
            status: 500,
            message: "Internal server error",
            success: false,
        };
    }
   
}

exports.ViewExploreImageService=async(published_id)=>{
    try{
        const query ="UPDATE exploremetrics SET views_count = views_count + 1 WHERE published_id =?"
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
exports.LikeExploreImageService=async(published_id,user_id)=>{
    try{
        const query="Insert into explorelikes (user_id,published_id) values (?,?)"
        const [rows] = await db.execute(query,[user_id,published_id])
        console.log("User liked the image")
       
    }catch(err){
        console.error("error inserting user like",err)
        if(err.code=="ER_DUP_ENTRY"){
            console.log("user already liked the image")
            return {
                status:400,
                message:"user already liked the image",
                success:false
            }
        }
        return {
            status:500,
            message:"like is counted but user is not",
            success:false
        }
    }
    
    try{
        const query ="UPDATE exploremetrics SET likes_count = likes_count + 1 WHERE published_id =?"
        const [rows] = await db.execute(query,[published_id])
        console.log("Like count for image is updated")
        
        return{
            status:200,
            message:"user liked the image",
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
exports.UnlikeExploreImageService=async(published_id,user)=>{
    try{
        const query="DELETE FROM explorelikes WHERE user_id =? AND published_id =?"
        const [rows] = await db.execute(query,[user,published_id])
        if(rows.affectedRows===0){
            console.log("user didn't unlike the image")
            return {
                status:404,
                message:"user didn't unlike the image",
                success:false
            }
        }
    }
    catch(err){
        console.error("error deleting user like",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }
    try{
        const query ="UPDATE exploremetrics SET likes_count = likes_count - 1 WHERE published_id =?"
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
exports.getExploreImagesByUserIdService=async(user_id)=>{
    try{
        const query ="SELECT * FROM explore WHERE user_id =?"
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
exports.deleteExploreImageByPublishedIdService=async(published_id,user_id)=>{
    try{
        const query ="DELETE FROM explore WHERE published_id =? AND user_id =?"
        const [rows] = await db.execute(query,[published_id,user_id])
        if(rows.affectedRows===0){
            console.log("user didn't delete the image")
            return {
                status:404,
                message:"user didn't delete the image",
                success:false
            }
        }
        console.log("image deleted successfully")
        return{
            status:200,
            message:"image deleted successfully",
            success:true
        }
    }catch(err){
        console.error("error deleting image",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }
}

exports.editCaptionService=async(published_id,caption,id)=>{
    try{
        const query ="UPDATE explore SET caption =? WHERE published_id =? AND user_id =?"
        const [rows] = await db.execute(query,[caption, published_id,id])
        if(rows.affectedRows===0){
            console.log("user didn't edit the caption")
            return {
                status:404,
                message:"user didn't edit the caption",
                success:false
            }
        }
        console.log("caption edited successfully")
        return{
            status:200,
            message:"caption edited successfully",
            success:true
        }
    }catch(err){
        console.error("error editing caption",err)
        return {
            status:500,
            message:"internal server error",
            success:false
        }
    }
}

exports.ImageReportService = async (image_id, userID, published_id, reason) => {
    try {
        if (!image_id || !published_id || !reason) {
            return {
                status: 400,
                message: 'Image ID, published ID, and reason are required.',
                success: false
            };
        }

        const [userData] = await db.query(`SELECT username FROM users WHERE user_id = ?`, [userID]);

        // Check if a report already exists
        const [existingReport] = await db.query(
            `SELECT report_id, report_details FROM image_reports 
             WHERE image_id = ? AND published_id = ?`,
            [image_id, published_id]
        );

        const newReportEntry = { 
            user_id: userID, 
            username: userData[0]?.username || 'Unknown',
            reason,
            reported_at: new Date().toISOString(),
            
        };

        if (existingReport.length > 0) {
            const report = existingReport[0];
            const reportDetails = report.report_details;

            // Check if user has already reported
            const alreadyReported = reportDetails.some(r => r.user_id === userID);
            if (alreadyReported) {
                return {
                    status: 409,
                    message: 'You have already reported this image.',
                    success: false
                };
            }

            // Append new report to existing details
            reportDetails.push(newReportEntry);

            await db.query(
                `UPDATE image_reports 
                 SET report_details = ?, report_count = report_count + 1
                 WHERE report_id = ?`,
                [JSON.stringify(reportDetails), report.report_id]
            );

            return {
                status: 200,
                message: 'Your report has been added.',
                success: true
            };
        } else {
            // Create new report entry
            const reportDetails = JSON.stringify([newReportEntry]);

            await db.query(
                `INSERT INTO image_reports (image_id, published_id, report_details, report_count)
                 VALUES (?, ?, ?, 1)`,
                [image_id, published_id, reportDetails]
            );

            return {
                status: 201,
                message: 'Image reported successfully.',
                success: true
            };
        }
    } catch (error) {
        console.error('Error reporting image:', error);
        return {
            status: 500,
            message: 'Server error while reporting image.',
            success: false
        };
    }
}


exports.videoReportService = async ({ story_id, reason, user_id }) => {
  try {
    if (!story_id || !reason) {
      return {
        status: 400,
        message: "Story ID and reason are required.",
        success: false,
      };
    }

    // 🔹 Step 1: Get username
    const [userData] = await db.query(
      `SELECT username FROM users WHERE user_id = ?`,
      [user_id]
    );
    const username = userData[0]?.username || "Unknown";

    // 🔹 Step 2: Get video_id from StoryToVideo
    const storyVideo = await StoryToVideo.findOne({
      where: { story_id },
      attributes: ["id"],
    });
    if (!storyVideo) {
      return {
        status: 404,
        message: "No video found for this story.",
        success: false,
      };
    }
    const video_id = storyVideo.id;

    // 🔹 Step 3: Get published_id from ExploreVideo
    const publishedVideo = await ExploreVideo.findOne({
      where: { story_id },
      attributes: ["id"],
    });
    const published_id = publishedVideo ? publishedVideo.id : null;

    // 🔹 Step 4: Check existing report for this video/published_id pair
    const existingReport = await VideoReport.findOne({
      where: { [Op.or]: [{ video_id }, { published_id }] },
    });

    // New report entry
    const newReportEntry = {
      reason,
      user_id,
      username,
      reported_at: new Date().toISOString(),
    };

    if (existingReport) {
      const reportDetails = existingReport.report_details || [];

      // Check if user already reported
      const alreadyReported = reportDetails.some(
        (r) => r.user_id === user_id
      );

      if (alreadyReported) {
        return {
          status: 409,
          message: "You have already reported this video.",
          success: false,
        };
      }

      // Append new report
      reportDetails.push(newReportEntry);

      await existingReport.update({
        report_details: reportDetails,
        report_count: reportDetails.length,
      });

      return {
        status: 200,
        message: "Your report has been added.",
        success: true,
      };
    }

    // 🔹 Step 5: Create new report record
    const newReport = await VideoReport.create({
      video_id,
      published_id,
      report_details: [newReportEntry],
      report_count: 1,
    });

    return {
      status: 201,
      message: "Video reported successfully.",
      success: true,
      data: newReport,
    };
  } catch (error) {
    console.error("Error in videoReportService:", error);
    return {
      status: 500,
      message: "Server error while reporting video.",
      success: false,
    };
  }
};

//139
//video id: 38
//publisged id: 9