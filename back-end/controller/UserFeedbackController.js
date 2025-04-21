const { getAllFeedbacksService, sendResponse, escalateFeedbackService, updateFeedbackStatusService, submitFeedbackService } = require("../service/UserFeedbackService");

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

    if (!response || response.trim().length === 0) {
        return res.status(400).json({ message: "Response is required" });
    }

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
  
    // Optional: validate status
    const validStatuses = ["pending", "in_progress", "reviewed", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
  
    const updateFeedbackStatus =  await updateFeedbackStatusService(id, status);

    return res.status(updateFeedbackStatus.status).json(updateFeedbackStatus);   
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