const express = require('express');
const db = require('../config/connectDatabase');

const checkUserStatus = async(req, res, next) => {
    const userId = req.user.id

    try{
        const user = await db.execute('SELECT status FROM users WHERE user_id = ?',[userId])
        
        // console.log(user);
        if(user.length === 0){
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if(user.status === "banned"){
            return res.status(403).json({ success: false, message: "User is banned" });
        }
        next();
    } catch (err) {
        console.error("Error checking user status",err)
        return res.status(500).json({ success: false, message: "Error verifying user status" });
    }
}

module.exports = { checkUserStatus };   