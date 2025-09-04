const db = require('../config/connectDatabase');
const bcrypt = require('bcrypt');

exports.createModeratorService = async ( username, email, password, dob, isVerified ) => {
    try {
        // Check if email already exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            return { status: 409, success: false, message: 'Email already in use' };
        }

        const today = new Date();
        const dobDate=new Date(dob)
        const age = today.getFullYear() - dobDate.getFullYear() - ((today.getMonth() < dobDate.getMonth() || (today.getMonth() === dobDate.getMonth() && today.getDate() < dobDate.getDate()))? 1 : 0);
        
        if (!password) {
           return { status: 400, success: false, message: 'Password is required' };
       }
         const hashedPassword = await bcrypt.hash(password, 10)


        await db.query(
            `INSERT INTO users 
             (username, email, password_hash, age, DOB, role, register_type, is_verified, status) 
             VALUES (?, ?, ?, ?, ?, 'moderator', 'password', ?, 'active')`,
            [username, email, hashedPassword, age, dob, isVerified]
        );

        return { status: 200, success: true, message: 'Moderator created successfully' };
    } catch (error) {
        console.error("Service error - createModerator:", error);
        return { status: 500, success: false, message: 'Database error' };
    }
};

exports.getAllModeratorsService = async () => {
    try {
        const [rows] = await db.query(
            `SELECT user_id, username, email, age, DOB, status, created_at, is_deleted, is_verified
             FROM users 
             WHERE role = 'moderator'
             ORDER BY created_at ASC`
        );

        return {
            status: 200,
            success: true,
            message: "Moderators fetched successfully",
            rows: rows
        };
    } catch (error) {
        console.error("Get Moderators Service Error:", error);
        return {
            status: 500,
            success: false,
            message: "Database error"
        };
    }
};


exports.getModeratorDetailService = async (userId) => {
    try {
    const [rows] = await db.query(
      `SELECT * FROM users WHERE role = 'moderator' AND  user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return {
        status: 404,
         success: false,
         message: "Moderator not found" };
    }

    return { 
        status: 200,
        success: true, 
        rows: rows[0] 
    };
  } catch (error) {
    console.error("Service error fetching moderator:", error);
    return { 
        status: 500,
        success: false,
        message: "Database error"
     };
  }
}

exports.updateModeratorService = async (user_id, username, email, dob, is_verified) => {
  try {
    const query = `
      UPDATE users 
      SET username = ?, email = ?, dob = ?, is_verified = ?
      WHERE user_id = ? AND role = 'moderator'
    `;
    const values = [username, email, dob, is_verified, user_id];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return {
        status: 404,
        success: false,
        message: 'Moderator not found or no changes made.'
      };
    }

    return {
      status: 200,
      success: true
    };
  } catch (error) {
    console.error("Service error updating moderator:", error);
    return {
      status: 500,
      success: false,
      message: 'Database error.'
    };
  }
};


exports.deleteModeratorService = async (user_id) => {
  try {
    const [result] = await db.query(
      `UPDATE users 
       SET is_verified = 0, status = 'deleted', is_deleted = 1 
       WHERE user_id = ? AND role = 'moderator'`,
      [user_id]
    );

    if (result.affectedRows === 0) {
      return {
        status: 404,
        success: false,
        message: "Moderator not found or already deleted.",
      };
    }

    return {
      status: 200,
      success: true,
      message: "Moderator soft-deleted successfully.",
    };
  } catch (error) {
    console.error("Service error deleting moderator:", error);
    return {
      status: 500,
      success: false,
      message: "Database error.",
    };
  }
};

