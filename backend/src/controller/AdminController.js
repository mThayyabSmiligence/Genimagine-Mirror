const { getAdminDetailService } = require("../service/AdminService");

exports.getAdminDetailController = async (req, res) => {
    const { id: user_id, role } = req.user;

    if (!user_id || role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Not a admin' });
    }

    const result = await getAdminDetailService(user_id);

    res.status(result.status).json(result);
  
}