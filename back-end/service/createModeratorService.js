const db = require('../config/connectDatabase');
const bcrypt = require('bcrypt');

exports.createModeratorService = async ( username, email, password, dob ) => {
    try {
        // Check if email already exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            return { status: 409, success: false, message: 'Email already in use' };
        }

        const today = new Date();
        const dobDate=new Date(dob)
        const age = today.getFullYear() - dobDate.getFullYear() - ((today.getMonth() < dobDate.getMonth() || (today.getMonth() === dobDate.getMonth() && today.getDate() < dobDate.getDate()))? 1 : 0);
        console.log(age);
        
        if (!password) {
           return { status: 400, success: false, message: 'Password is required' };
       }
         const hashedPassword = await bcrypt.hash(password, 10)


        await db.query(
            `INSERT INTO users 
             (username, email, password_hash, age, DOB, role, register_type, is_verified, status) 
             VALUES (?, ?, ?, ?, ?, 'moderator', 'password', 1, 'active')`,
            [username, email, hashedPassword, age, dob]
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
            `SELECT user_id, username, email, age, DOB, status, created_at, is_deleted
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

exports.updateModeratorService = async (user_id, username, email, password, dob) => {
  try {
    let query = '';
    let values = [];

    if (password && password.trim() !== '') {
        // need to add is active if needed
      query = `
        UPDATE moderators 
        SET username = ?, email = ?, password = ?, dob = ?                                                 
        WHERE id = ?
      `;
      values = [username, email, password, dob, user_id];
    } else {
      query = `
        UPDATE moderators 
        SET username = ?, email = ?, dob = ?
        WHERE id = ?
      `;
      values = [username, email, dob, user_id];
    }

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


