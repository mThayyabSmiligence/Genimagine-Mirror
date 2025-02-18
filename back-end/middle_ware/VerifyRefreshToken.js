const jwt = require('jsonwebtoken');
const cookie = require("cookie")


// const user = {id}
const verifyRefreshToken = (req, res, next)=> {

    let refreshToken =null;

    try{

        const cookies= cookie.parse(req.headers.cookie)
        const token = cookies.refresh_token
        refreshToken= token
  
    }
    catch(err){
        res.status(401).json({ message: 'Access Denied. No refresh token provided.' }) 
        return;
    }


    if (!refreshToken) return res.status(401).json({ message: 'Access Denied. No token provided.' });

    const secretKey = process.env.JWT_REFRESH_SECRET_KEY;
    try {
        const verified = jwt.verify(refreshToken, secretKey);
        req.user = verified; 
        console.log(verified)  
        console.log(refreshToken)
        next();
        console.log("nothing")
    } catch (err) {
        res.status(401).json({ message: 'Invalid refresh jdij token.' });
    }
}; 

module.exports = verifyRefreshToken