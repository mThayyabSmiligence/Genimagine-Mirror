const db = require('../config/connectDatabase');
const { decrypt } = require('./EncrypDecrypt');
const { banUserService, suspendUserService, warnUser } = require('./UserService');

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

    const result = await banUserService(uploader.user_id);

    if (result.success) {
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
    const uploader = await getUploaderFromReport(report_id);
    if (!uploader) return { status: 404, success: false, message: "Report not found." };

    const result = await suspendUserService(uploader.user_id, minutes, reason);

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
