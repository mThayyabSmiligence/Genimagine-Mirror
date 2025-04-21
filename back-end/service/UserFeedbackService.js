const db = require('../config/connectDatabase');

exports.getAllFeedbacksService = async() => {
    try{
        const query = 'SELECT * FROM user_feedback ORDER BY created_at DESC';
        const [rows] = await db.execute(query)

        if (rows.length === 0) {
            return {
                status: 404,
                message: "No feedbacks found",
                
            };
        }

        console.log("Feedbacks fetched successfully:", rows[0]);

        return {
            status: 200,
            message: "Feedbacks fetched successfully",   
            rows: rows[0]
        }
    } catch(error) {
        console.error("Error fetching feedbacks:", error);
        return {
            status: 500,
            message: "Internal server error",
            error: error.message
        };
    }
  };
  
  exports.sendResponse = async(id, response, moderatorId, moderatorName) => {
    try{
        const query = `
        UPDATE user_feedback 
        SET response = ?, 
            status = 'reviewed',
            response_by_id = ?,
            response_by_name = ?
        WHERE feedback_id = ?`;

        const [rows] = await db.execute(query, [response, moderatorId, moderatorName, id]);

        if (rows.affectedRows === 0) {
            return {
                status: 404,
                message: "Feedback not found",
            };
        }

        console.log("Feedback response sent successfully:", rows);
        return {
            status: 200,
            message: "Feedback response sent successfully",
            rows
        };
    }catch(error) {
        console.error("Error sending feedback response:", error);
        return {
            status: 500,
            message: "Internal server error",
            error: error.message
        };
    }
};

exports.updateFeedbackStatusService = async(id, status) => {
    try{
        const query = `UPDATE user_feedback SET status = ? WHERE feedback_id = ?`;
        const [rows] = await db.execute(query, [status, id]);

        if (rows.affectedRows === 0) {
            return {
                status: 404,
                message: "Feedback not found",
            };
        }

        console.log("Feedback status updated successfully:", rows);
        return {
            status: 200,
            message: "Feedback status updated successfully",
            rows
        };
    }catch(error) {
        console.error("Error updating feedback status:", error);
        return {
            status: 500,
            message: "Internal server error",
            error: error.message
        };
    }
  };
  

exports.escalateFeedbackService = async(id, note, moderatorId, moderatorName) => {
    try{
    const query = `
      UPDATE user_feedback 
      SET escalated_to_admin = TRUE,
          status = 'in_progress',
          escalation_note = ?,
          escalated_by_id = ?,
          escalated_by_name = ?,
          escalated_at = NOW()
      WHERE feedback_id = ?`;
    const [rows] = await db.execute(query, [note, moderatorId, moderatorName, id]);

    if (rows.affectedRows === 0) {
        return {
            status: 404,
            message: "Feedback not found",
        };
    }

    console.log("Feedback escalated successfully:", rows);

    return {
        status: 200,
        message: "Feedback escalated successfully",
        rows
    };

    }catch(error) {
        console.error("Error escalating feedback:", error);
        return {
            status: 500,
            message: "Internal server error",
            error: error.message
        };
    };
}

exports.submitFeedbackService = async({ userId, category, message }) => {
    if (!userId || !category || !message) {
        return {
            status: 400,
            message: "All fields are required",
        };
    }



    if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Message is required" });
      }
    
    //   const wordCount = message.trim().split(/\s+/).length;
    //   if (wordCount < 200 || wordCount > 300) {
    //     return res.status(400).json({ message: "Message must be between 200 and 300 words", wordCount });
    //   }

    try{
        const query = `
          INSERT INTO user_feedback (user_id, category, message)
          VALUES (?, ?, ?)
        `;
        
        const [submitFeedback] = await db.execute(query, [userId, category, message]);

        console.log("Feedback submitted successfully:", submitFeedback);
        return {
            status: 200,
            message: "Feedback submitted successfully",
            // feedbackId: submitFeedback.insertId\\

        };
    } catch(error) {
        console.error("Error submitting feedback:", error);
        return {
            status: 500,
            message: "Internal server error",
            error: error.message
        };
    }
};
  