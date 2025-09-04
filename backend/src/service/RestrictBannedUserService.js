// services/checkUserStatusService.js
const db = require('../config/connectDatabase');

const   checkUserStatusService = async (userId) => {
    try {
        const [user] = await db.execute('SELECT status, is_deleted FROM users WHERE user_id = ?', [userId]);

        if (user.length === 0) {
            return { allowed: false, message: "User not found" };
        }
        console.log(user, "nothing" );      

        const { status: userStatus, is_deleted } = user[0];

        if (is_deleted === 1) {
            return { allowed: false, message: "User is deleted" };
        }

        if (userStatus === "banned") {
            return { allowed: false, message: "User is banned" };
        }

        if (userStatus === "suspended") {
            const [suspension] = await db.execute(
                "SELECT suspension_end FROM suspended_users WHERE user_id = ?",
                [userId]
            );

            if (suspension.length > 0) {
                const suspensionEnd = new Date(suspension[0].suspension_end).getTime();
                const currentTime = Date.now();

                if (currentTime < suspensionEnd) {
                    return {
                        allowed: false,
                        message: "User is suspended. Try again later.",
                        suspension_end: suspension[0].suspension_end
                    };
                } else {
                    // Suspension expired: restore status
                    await db.execute("UPDATE users SET status = 'active' WHERE user_id = ?", [userId]);
                }
            }
        }

        return { allowed: true }; // All good
    } catch (err) {
        console.error("Error in checkUserStatusService:", err);
        return { allowed: false, message: "Internal server error" };
    }
};

module.exports = { checkUserStatusService };
