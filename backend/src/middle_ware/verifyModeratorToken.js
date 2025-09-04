const jwt = require('jsonwebtoken');
const cookie = require("cookie");

const verifyModeratorToken = async(req,res,next) => {
    let jwtToken =null;
    let refreshToken =null

    try{
        const cookies= cookie.parse(req.headers.cookie)
        const token = cookies.token
        refreshToken= cookies.refresh_token
        jwtToken= token
    }
    catch(err){
        res.status(401).json({ message: 'Access Denied. No token provided.' }) 
        return;
    }
    
    if (!jwtToken && !refreshToken) return res.status(401).json({ message: 'Access Denied. No token provided.' });

    const secretKey = process.env.JWT_SECRET_KEY;
    try {
        const verified = jwt.verify(jwtToken, secretKey);
        req.user = verified; 
        if(verified.role != 'moderator'){
            res.status(401).json({ message: 'Access Denied'}); 
            return
        }

        // const [rows] = await db.query(
        //     `SELECT is_verified FROM users WHERE user_id = ?`,
        //     [verified.user_id]
        // );

        // if (!rows.length || rows[0].is_verified !== 1) {
        //     return res.status(403).json({ message: 'Access Denied. Moderator not verified.' });
        // }


        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
            return
    }
}

module.exports = verifyModeratorToken;