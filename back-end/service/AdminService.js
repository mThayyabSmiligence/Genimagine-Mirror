const db = require('../config/connectDatabase');

exports.getAdminDetailService = async (user_id) => {
  try {
    const [rows] = await db.execute(
      `SELECT user_id, username, age, email, role, dob, status, created_at, updated_at 
       FROM users 
       WHERE user_id = ? AND role = 'admin' AND is_deleted = 0 AND is_verified = 1
       LIMIT 1`,
      [user_id]
    );

    if (rows.length === 0) {
      return {
        status: 404,
        success: false,
        message: 'Admin not found',
      };
    }

    return {
      status: 200,
      success: true,
      message: 'Admin detail fetched successfully',
      rows: rows[0],
    };
  } catch (error) {
    console.error('Error in getAdminDetailService:', error);
    return {
      status: 500,
      success: false,
      message: 'Database error while fetching admin detail',
    };
  }
};