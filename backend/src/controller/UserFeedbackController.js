const { getAllFeedbacksService, sendResponse, escalateFeedbackService, updateFeedbackStatusService, submitFeedbackService } = require("../service/UserFeedbackService");
const db = require('../config/connectDatabase');

// get all feedbacks
exports.getAllFeedbacksController = async(req, res) => {

    const getAllFeedbacks = await getAllFeedbacksService();

    return res.status(getAllFeedbacks.status).json(getAllFeedbacks); 
};

// respond to user feedbacks
exports.respondToFeedbackController = async (req, res) => {
    const { id } = req.params;
    const { response } = req.body;
    const moderatorId = req.user.id;
    const moderatorName = req.user.username;

    // const wordCount = response.trim().split(/\s+/).length;
    // if (wordCount > 300) {
    //     return res.status(400).json({ message: "Response should not exceed 300 words" });
    // }
  
    const responses =  await sendResponse(id, response, moderatorId, moderatorName);

    return res.status(responses.status).json(responses);
};

exports.updateFeedbackStatusController = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const categoryStatusMap = {
        feature_request: ["pending", "in_progress", "reviewed"],
        complaint: ["pending", "in_progress", "reviewed", "resolved"],
        bug_report: ["pending", "in_progress", "reviewed", "resolved"],
      };
    
      try {
        const [rows] = await db.execute(
          "SELECT category FROM user_feedback WHERE feedback_id = ?",
          [id]
        );
    
        if (!rows.length) {
          return res.status(404).json({ message: "Feedback not found" });
        }
    
        const category = rows[0].category;
        const allowedStatuses = categoryStatusMap[category];
    
        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            message: `Invalid status '${status}' for category '${category}'`,
            allowedStatuses,
          });
        }

    // Optional: validate status
    // const validStatuses = ["pending", "in_progress", "reviewed", "resolved"];
    // if (!validStatuses.includes(status)) {
    //   return res.status(400).json({ message: "Invalid status value" });
    // }
  
    const updateFeedbackStatus =  await updateFeedbackStatusService(id, status);

    return res.status(updateFeedbackStatus.status).json(updateFeedbackStatus);  
    } catch (error) {
        console.error("Error updating feedback status:", error);
        return res.status(500).json({ message: "Internal server error" });
    } 
};
  

exports.escalateFeedbackController = async(req, res) => {
    const { id } = req.params;
    const { escalation_note } = req.body;
    const moderatorId = req.user.id;
    const moderatorName = req.user.username;   

    if (!escalation_note || escalation_note.trim().length === 0) {
        return res.status(400).json({ message: "Escalation note is required" });
    }

    // const wordCount = escalation_note.trim().split(/\s+/).length;
    // if (wordCount > 300) {
    //     return res.status(400).json({ message: "Escalation note should not exceed 300 words" });
    // }
  
    const escalate  = await escalateFeedbackService(id, escalation_note, moderatorId, moderatorName);

    return res.status(escalate.status).json(escalate);
};
  
exports.submitFeedbackController = async (req, res) => {
    const { category, message } = req.body;
    const userId = req.user.id;
  
    if (!userId || !category || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    const result = await submitFeedbackService({ userId, category, message });
    return res.status(result.status).json(result);
};