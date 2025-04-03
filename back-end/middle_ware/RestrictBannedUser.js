const express = require('express');
const db = require('../config/connectDatabase');

const checkUserStatus = async(req, res, next) => {
    const userId = req.user.id

    try{
        const user = await db.execute('SELECT status, is_deleted FROM users WHERE user_id = ?',[userId])
        
        // console.log(user);
        if(user.length === 0){
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const {userStatus, is_deleted} = user[0].status;

        if (is_deleted === 1) {
            return res.status(403).json({ success: false, message: "User is deleted" });
        }

        if (userStatus === "banned") {
            return res.status(403).json({ success: false, message: "User is banned" });
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
                    return res.status(403).json({
                        success: false,
                        message: "User is suspended. Try again later.",
                        suspension_end: suspension[0].suspension_end
                    });
                } else {
                    await db.execute("UPDATE users SET status = 'active' WHERE user_id = ?", [userId]);
                    await db.execute("DELETE FROM suspended_users WHERE user_id = ?", [userId]);
                }
            }
        }
        next();
    } catch (err) {
        console.error("Error checking user status",err)
        return res.status(500).json({ success: false, message: "Error verifying user status" });
    }
}

module.exports = { checkUserStatus };   


// const db = require('../config/connectDatabase');

// const restoreSuspendedUsers = async () => {
//     try {
//         const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");

//         // Get users whose suspension has expired
//         const [suspendedUsers] = await db.execute(
//             "SELECT user_id FROM suspended_users WHERE suspension_end <= ?", 
//             [currentTime]
//         );

//         if (suspendedUsers.length > 0) {
//             const userIds = suspendedUsers.map(user => user.user_id);
            
//             // Restore status to 'active' in the users table
//             await db.execute(
//                 `UPDATE users SET status = 'active' WHERE user_id IN (${userIds.join(",")})`
//             );

//             // Remove expired suspensions from the suspended_users table
//             await db.execute(
//                 "DELETE FROM suspended_users WHERE suspension_end <= ?",
//                 [currentTime]
//             );

//             console.log(`Restored ${suspendedUsers.length} users to active status.`);
//         }
//     } catch (error) {
//         console.error("Error restoring suspended users:", error.message);
//     }
// };

// // Run every minute (or use a proper cron job scheduler like node-cron)
// setInterval(restoreSuspendedUsers, 60 * 1000); // Runs every 1 minute

// module.exports = restoreSuspendedUsers;
