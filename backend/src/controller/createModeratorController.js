const { getAllModeratorsService, createModeratorService, updateModeratorService, getModeratorDetailService, deleteModeratorService } = require("../service/createModeratorService");



exports.createModeratorController = async (req, res) => {
    try {
        const { username, email, password, dob, isVerified } = req.body;

        if (!username || !email || !password || !dob || !isVerified) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const result = await createModeratorService( username, email, password, dob, isVerified);

        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Create moderator error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getAllModeratorsController = async (req, res) => {
    
    const result = await getAllModeratorsService();

    return res.status(result.status).json(result);
};

exports.getModeratorDetailController = async (req, res) => {

    const { user_id } = req.params;
    
    const result = await getModeratorDetailService(user_id);

    return res.status(result.status).json(result)
}

exports.updateModeratorController = async (req, res) => {
    const { user_id } = req.params;
    const { username, email, dob, is_verified } = req.body;

    if (!username || !email || !dob || typeof is_verified === 'undefined') {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const result = await updateModeratorService(user_id, username, email, dob, is_verified);

    return res.status(result.status).json(result);
}

exports.deleteModeratorController = async (req, res) => {
    const { user_id } = req.params;
 
    const result = await deleteModeratorService(user_id);

    return res.status(result.status).json(result);
};
