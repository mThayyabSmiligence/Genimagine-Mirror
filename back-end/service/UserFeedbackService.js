const db = require('../config/connectDatabase');
const { sendMailHTML } = require('./emailService');

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
            rows: rows
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

        if (!moderatorId || !moderatorName) {
            return res.status(400).json({ message: "Moderator ID and name are required" });
        }
    
        if (!id) {
            return res.status(400).json({ message: "Feedback ID is required" });
        }
    
        if (!response || response.trim().length === 0) {
            return res.status(400).json({ message: "Response is required" });
        }

        const [feedbackData] = await db.execute(
            `SELECT uf.feedback_id, uf.message, uf.category, uf.user_id, u.email, u.username
             FROM user_feedback uf
             JOIN users u ON uf.user_id = u.user_id
             WHERE uf.feedback_id = ?`,
            [id]
        );

        if (!feedbackData || feedbackData.length === 0) {
            return {
                succuss: false,
                status: 404,
                message: "Feedback not found",
            };
        }

        const feedback = feedbackData[0];

        const updateQuery = `
            UPDATE user_feedback 
            SET response = ?, 
                status = 'reviewed',
                response_by_id = ?,
                response_by_name = ?,
                response_at = NOW()
            WHERE feedback_id = ?`;

        const [rows] = await db.execute(updateQuery, [response, moderatorId, moderatorName, id]);

        if (rows.affectedRows === 0) {
            return {
                success: false,
                status: 404,
                message: "Failed to update feedback response",
            };
        }

        const subject = `Response to your ${feedback.category} on Genimagine`;
        const htmlContent = `
            <p>Hi <strong>${feedback.username}</strong>,</p>
            <p>Thank you for your <strong>${feedback.category}</strong>:</p>
            <blockquote style="background: #f8f8f8; padding: 10px; border-left: 4px solid #007bff;">
                ${feedback.message}
            </blockquote>
            <p><strong>Moderator's response:</strong></p>
            <blockquote style="background: #f0f0f0; padding: 10px; border-left: 4px solid #28a745;">
                ${response}
            </blockquote>
            <p>We appreciate your feedback and your help in improving Genimagine.</p>
            <p><strong>– Genimagine Moderator Team</strong></p>
        `;

        const emailSent = await sendMailHTML(feedback.email, subject, htmlContent);

        if (!emailSent) {
            return {
                success: false,
                status: 500,
                message: "Feedback updated, but failed to send email",
            };
        }

        return {
            success: true,
            status: 200,
            message: "Feedback responded and email sent successfully",
        };
    }catch(error) {
        console.error("Error sending feedback response:", error);
        return {
            success: false,
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
  