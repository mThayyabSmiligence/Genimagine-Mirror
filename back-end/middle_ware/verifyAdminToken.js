const jwt = require('jsonwebtoken');
const cookie = require("cookie");

const verifyAdminToken = async(req,res,next) => {
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
        if(verified.role != 'admin'){
            res.status(401).json({ message: 'Access Denied'}); 
            return
        }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
            return
    }
}

module.exports = verifyAdminToken;