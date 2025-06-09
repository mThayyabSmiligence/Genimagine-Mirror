const { getModeratorDetailService } = require("../service/ModeratorService");

exports.getModeratorDetailController = async (req, res) => {
    const { id: user_id, role } = req.user;

    if (!user_id || role !== 'moderator') {
      return res.status(403).json({ success: false, message: 'Access denied: Not a moderator' });
    }

    const result = await getModeratorDetailService(user_id);

    res.status(result.status).json(result);
  
}

// exports.updateModeratorProfileImageController = async (req, res) => {
//   const { profile_image } = req.body;
//   const moderatorId = req.user.user_id; // assuming verified JWT

//   if (!profile_image) {
//     return res.status(400).json({ message: 'Image URL is required' });
//   }

//   try {
//     await db.query(`UPDATE moderators SET profile_image = ? WHERE user_id = ?`, [profile_image, moderatorId]);
//     res.status(200).json({ message: 'Profile image updated' });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
