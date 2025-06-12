const db = require('../config/connectDatabase');
const { decrypt } = require('./EncrypDecrypt');
const { deleteFromServer } = require('./UploadToServerService');
const { banUserService, suspendUserService, warnUser } = require('./UserService');

// exports.getUserListWithReportCountService = async () => {
//   try {
//     const [users] = await db.execute(`
//       SELECT 
//         u.*, 
//         COUNT(DISTINCT ir.report_id) AS reported_image_count
//       FROM users u
//       LEFT JOIN explore e ON e.user_id = u.user_id
//       LEFT JOIN image_reports ir ON ir.published_id = e.published_id
//       GROUP BY u.user_id
//       ORDER BY u.created_at DESC
//     `);

//     return { status: 200, users };
//   } catch (err) {
//     console.error("Error fetching user report data:", err);
//     return { status: 500, message: "Failed to fetch user data with report counts" };
//   }
// };

exports.getUserReportedImageCountsService = async () => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        u.user_id, 
        COUNT(ir.report_id) AS report_count,
        COUNT(CASE WHEN ir.action_type = 'no_action' THEN 1 END) AS no_action_count,
        COALESCE(s.suspend_count, 0) AS suspend_count
      FROM users u
      LEFT JOIN explore e ON u.user_id = e.user_id
      LEFT JOIN image_reports ir ON ir.published_id = e.published_id
       LEFT JOIN (
        SELECT user_id, COUNT(*) AS suspend_count
        FROM suspended_users
        GROUP BY user_id
      ) s ON u.user_id = s.user_id
      GROUP BY u.user_id
    `);

    return {
      status: 200,
      message: "Reported image counts fetched successfully",
      data: rows
    };
  } catch (err) {
    console.error("Error in getUserReportedImageCountsService:", err);
    return {
      status: 500,
      message: "Database error fetching reported image counts",
      error: err
    };
  }
};

exports.getAllReportedImagesService = async() =>{
    try{
    const query = 
    `
    SELECT 
    ir.report_id,
    ir.reported_at,
    ir.image_id,
    ir.report_details,
    ir.report_count,
    ir.action_type,
    gi.prompt,
    gi.image_url,
    e.caption,
    u.warning_data,
    u.username AS uploader_username,
    u.user_id AS uploader_id
    FROM image_reports ir
    LEFT JOIN generated_images gi ON ir.image_id = gi.image_id
    LEFT JOIN explore e ON ir.published_id = e.published_id
    LEFT JOIN users u ON gi.user_id = u.user_id
    WHERE ir.action_type != 'no_action' -- Exclude reports with action_type = 'no_action'
    ORDER BY ir.reported_at DESC
    `;
    
    const [rows] = await db.execute(query)
    console.log(rows)
    
    const decryptedRows = rows.map((row) => {
      try{
        return{
          ...row,
          prompt : decrypt(row.prompt)
        };
      }catch (err) {
        console.error(`Error decrypting prompt for report_id ${row.report_id}`, err);
        return {
          ...row,
          prompt: "[Decryption Failed]"
        };
      }
    })

    return{
        status: 200,
        message: "retrieved all reported images and data",
        data: decryptedRows
    };
    

    }catch(error){
        console.error("error retrieveing reported image detail and data")
        return{
           status : 500,
           message: "error retrieveing reported image list and data"
        }
    }

}

 

exports.getReportedImageDetailByReportIdService = async(report_id) => {
    try{
    const query = 
    ` 
    SELECT 
    ir.report_id,
    ir.image_id,
    ir.published_id,
    ir.report_details,
    ir.report_count,
    ir.reported_at,
    ir.action_type,
    ir.action_taken_by,
    ir.action_taken_at,
    gi.prompt AS image_prompt,
    gi.image_url AS generation_image_url,
    gi.image_path,
    e.image_url AS explore_image_url,
    e.caption AS explore_caption,
    u.username AS uploader_username,
    u.user_id AS uploader_id,
    u.warning_data
    FROM image_reports ir
    LEFT JOIN generated_images gi ON ir.image_id = gi.image_id
    LEFT JOIN explore e ON ir.published_id = e.published_id
    LEFT JOIN users u ON gi.user_id = u.user_id
    WHERE ir.report_id = ?
    ORDER BY ir.reported_at DESC
    `
    const [reportDetails] = await db.execute(query, [report_id]);
    console.log(reportDetails)

    if (reportDetails.length === 0) {
    throw new Error("No report found with this ID");
    }

    const image_prompt = decrypt(reportDetails[0].image_prompt)
    reportDetails[0].image_prompt = image_prompt
    console.log("prompt decrypted",reportDetails[0].image_prompt)

    return{
        status: 200,
        message: "get reported detail successfully",
        reportDetails
    }

    // const reports = rows[0];

    }catch(error){
        console.error("error getting reported image detail. ",error)
        return {
            status : 500,
            message: "error getting reported image detail"
        }
    }
} 

// exports.getReportedImagesByUserService = async(userId) => {
  
//     try {
//         const [rows] = await db.execute(
//             `SELECT
//                 ir.image_id,
//                 ir.report_count,
//                 ir.report_details,
//                 ir.action_type
//              FROM image_reports ir
//              JOIN explore e ON ir.published_id = e.published_id
//              WHERE e.user_id = ?
//              ORDER BY ir.reported_at DESC`,
//             [userId]
//         );

//         // Parse report_details JSON and extract reasons
//         // const formattedReports = rows.map(row => {
//         //     const details = JSON.parse(row.report_details || '[]');
//         //     const reasons = details.map(item => item.reason).filter(Boolean);
//         //     return {
//         //         image_id: row.image_id,
//         //         report_count: row.report_count,
//         //         report_reasons: reasons,
//         //         action_type: row.action_type
//         //     };
//         // });

//         return{
//           status: 200,
//           message: "retrieved reported image data of the user successfully ",
//           // reportedImages: formattedReports
//           rows
//         }
//         // res.status(200).json({ reportedImages: formattedReports });

//     } catch (err) {
//         console.error("Error fetching reported images by user:", err);
//         // res.status(500).json({ message: "Internal server error" });
//         return{
//           status: 500,
//           message: "Error fetching reported images by user",
//         }
//     }
// };

// exports.handleReportedImageActionService = async (
//     report_id,
//     action_type,
//     action_taken_by,
//     action_taken_by_role,
//     optionalParams = {}
//   ) => {
//     try {
//       // Get the user_id of the image uploader from the report
//       const [reportRows] = await db.execute(
//         `SELECT ir.image_id, gi.user_id 
//          FROM image_reports ir 
//          LEFT JOIN generated_images gi ON ir.image_id = gi.image_id 
//          WHERE ir.report_id = ?`,
//         [report_id]
//       );
//       console.log("reported images",reportRows)

//       if (reportRows.length === 0) {
//         return {
//           status: 404,
//           success: false,
//           message: "Reported image not found.",
//         };
//       }

//       const { user_id } = reportRows[0];        
//       let actionResponse;
  
//       if (action_type === 'ban') {
//         actionResponse = await banUserService(user_id);
//       } else if (action_type === 'suspend') {
//         const { minutes, reason } = optionalParams;
//         if (!minutes || !reason) {
//           return {
//             status: 400,
//             success: false,
//             message: "Suspension requires 'minutes' and 'reason'.",
//           };
//         }
//         actionResponse = await suspendUserService(user_id, minutes, reason);
//       } else if (action_type === 'warn') {
//         const { reason } = optionalParams;
//         if (!reason) {
//           return {
//             status: 400,
//             success: false,
//             message: "Warning requires 'reason'.",
//           };
//         }
//         actionResponse = await warnUser(user_id, reason, action_taken_by, action_taken_by_role);
//       } else {
//         return {
//           status: 400,
//           success: false,
//           message: "Invalid action_type. Allowed: 'ban', 'suspend', 'warn'.",
//         };
//       }
  
//       // Log action if success
//       if (actionResponse.success) {
//         await db.execute(
//           `UPDATE image_reports 
//            SET action_taken_by = ?, action_type = ?, action_taken_at = NOW() 
//            WHERE report_id = ?`,
//           [action_taken_by, action_type, report_id]
//         );
//       }
    
//     return{
//         status: 200,
//         message: "okayy fine",
//         actionResponse
//     }
  
//     } catch (error) {
//       console.error("Error handling report action:", error);
//       return {
//         status: 500,
//         success: false,
//         message: "An error occurred while processing the action.",
//         error: error.message,
//       };
//     }
//   };



async function getUploaderFromReport(report_id) {
  const [rows] = await db.execute(
    `SELECT ir.image_id, gi.user_id 
     FROM image_reports ir 
     LEFT JOIN generated_images gi ON ir.image_id = gi.image_id 
     WHERE ir.report_id = ?`,
    [report_id]
  );
  return rows[0];
}

exports.banReportedImageUserService = async (report_id, action_taken_by) => {
  try {
    const uploader = await getUploaderFromReport(report_id);
    if (!uploader) return { status: 404, success: false, message: "Report not found." };

    const result = await banUserService(uploader.user_id, action_taken_by);
    
    if (result.success == false) {
      return result;
    }

    await db.execute(
        `UPDATE image_reports SET action_type = 'ban', action_taken_by = ?, action_taken_at = NOW() WHERE report_id = ?`,
        [action_taken_by, report_id]
    );

    return {
        status: 200,
        success: true,
        message: "User banned successfully for reported image.",
    }
    
  } catch (error) {
    return { status: 500, success: false, message: "Failed to ban user", error: error.message };
  }
};

exports.suspendReportedImageUserService = async (report_id, action_taken_by, { minutes, reason }) => {
  try {
    if (!minutes || !reason) {
      console.error("Suspension requires 'minutes' and 'reason'.");
      return { status: 400, success: false, message: "Suspension requires 'minutes' and 'reason'." };
    }

    const uploader = await getUploaderFromReport(report_id);
    if (!uploader) return { status: 404, success: false, message: "Report not found." };

    const result = await suspendUserService(uploader.user_id, minutes, reason, action_taken_by);

    if (result.success == false) {
        return result;
    }

    await db.execute(
        `UPDATE image_reports SET action_type = 'suspend', action_taken_by = ?, action_taken_at = NOW() WHERE report_id = ?`,
        [action_taken_by, report_id]
    );

    return {
        status: 200,
        success: true,
        message: "User suspended successfully for reported image.",
      }
  } catch (error) {
    return { status: 500, success: false, message: "Failed to suspend user", error: error.message };
  }
};

exports.warnReportedImageUserService = async (report_id, action_taken_by, action_taken_by_role, reason) => {
  try {

    if (!reason) {
      console.error("Warning requires 'reason'.");
      return { status: 400, success: false, message: "Warning requires 'reason'." };
    }

    const uploader = await getUploaderFromReport(report_id);
    if (!uploader) return { status: 404, success: false, message: "Report not found." };

    const result = await warnUser(uploader.user_id, reason, action_taken_by, action_taken_by_role);

    if (result.success == false) {
        return result;
    }

    await db.execute(
        `UPDATE image_reports SET action_type = 'warn', action_taken_by = ?, action_taken_at = NOW() WHERE report_id = ?`,
        [action_taken_by, report_id]
    );

    return{
        status: 200,
        success: true,
        message: "User warned successfully for reported image.",
    }
    
  } catch (error) {
    return { status: 500, success: false, message: "Failed to warn user", error: error.message };
  }
};


exports.markReportedImageAsNoAction = async (report_id, action_taken_by) => {
  try {
    const uploader = await getUploaderFromReport(report_id);
    if (!uploader) return { status: 404, success: false, message: "Report not found." };

    await db.execute(
      `UPDATE image_reports 
       SET action_type = 'no_action', action_taken_by = ?, action_taken_at = NOW() 
       WHERE report_id = ?`,
      [action_taken_by, report_id]
    );

    return {
      status: 200,
      success: true,
      message: "Marked as no action required for reported image.",
    };

  } catch (error) {
    return {
      status: 500,
      success: false,
      message: "Failed to mark as no action",
      error: error.message
    };
  }
};

// const deleteImageFromServer = async (filePath, userId, chatId, imageId) => {
//   try {
//     // Delete file from S3
//     const params = {
//       Bucket: process.env.AWS_BUCKET, // Your S3 bucket name
//       Key: filePath, // File name
//     };
//     const command = new DeleteObjectCommand(params);
//     await s3.send(command);
//     return {status:200, success:true,message:"file is deleted"}
//   } catch (err) {
//     console.error('Error deleting file:', err);
//     return {status:500,success:false,message:"error deleting file from amazon s3",error:err}
//   }
// }

exports.deleteReportedImageService = async (report_id, image_id, published_id, image_path , userId, reason  ) => {
  try {
    
    // const [rows] = await db.execute(
    //   `SELECT 
    //      gi.image_id, gi.prompt, gi.image_url AS generated_url, gi.created_at,
    //      ex.published_id, ex.caption, ex.image_url AS explore_url, ex.published_date,
    //      exm.likes_count, exm.views_count, exm.ranking_score,
    //      ir.report_id, ir.report_details, ir.reported_at, ir.report_count
    //    FROM generated_images gi
    //    LEFT JOIN explore ex ON gi.image_id = ex.image_id
    //    LEFT JOIN exploremetrics exm ON ex.published_id = exm.published_id
    //    LEFT JOIN image_reports ir ON gi.image_id = ir.image_id OR ex.published_id = ir.published_id
    //    WHERE gi.image_id = ? AND ex.published_id = ?`,
    //   [image_id, published_id]
    // );

    // if (!rows.length) {
    //   return {
    //     status: 404,
    //     success: false,
    //     message: 'Image or related data not found.'
    //   };
    // }


    // const [reportRows] = await db.execute(
    //   `SELECT report_details FROM image_reports WHERE image_id = ? OR published_id = ? LIMIT 1`,
    //   [image_id, published_id]
    // );

    // if (reportRows.length === 0) {
    //   return {
    //     status: 404,
    //     success: false,
    //     message: 'Report not found for the given image_id or published_id.',
    //   };
    // }

    // console.log(reportRows, "check details")
    // const reportedBy = reportRows[0].user_id;

    await db.execute(
      `INSERT INTO moderator_image_actions (image_id, action, reason, report_id, deleted_by)
       VALUES (?, 'delete', ?, ?, ?)`,
      [image_id, reason, report_id, userId]
    );

    const s3DeleteResult = await deleteFromServer(image_path, userId, null, image_id);
    if (!s3DeleteResult.success) {
      throw new Error('Failed to delete image from AWS S3');
    }


    await db.execute('DELETE FROM explorelikes WHERE published_id = ?', [published_id]);

    await db.execute('DELETE FROM exploremetrics WHERE published_id = ?', [published_id]);

    await db.execute('DELETE FROM explore WHERE published_id = ?', [published_id]);

    await db.execute('DELETE FROM image_reports WHERE image_id = ? OR published_id = ?', [image_id, published_id]);

    await db.execute('DELETE FROM generated_images WHERE image_id = ?', [image_id]);


    return {
      status: 200,
      success: true,
      message: 'Image and all related metadata deleted successfully.',
      // deleted_image_data: rows[0]
    };
  } catch (error) {
    console.error('Service Error:', error);
    return {
      status: 500,
      success: false,
      message: 'Failed to delete image and metadata.',
      error: error.message
    };
  }
};  