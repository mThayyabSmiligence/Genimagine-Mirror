const jwt = require('jsonwebtoken');
const cookie = require("cookie");

const NoAuthMiddleWare = (req, res, next) => {
        let jwtToken =null;
        let refreshToken =null
    
        try{
            const cookies= cookie.parse(req.headers.cookie)
            const token = cookies.token
            refreshToken= cookies.refresh_token
            jwtToken= token
        }
        catch(err){
            return next();
        }
        
        if (!jwtToken && !refreshToken) return next();
    
        const secretKey = process.env.JWT_SECRET_KEY;
        try {
            const verified = jwt.verify(jwtToken, secretKey);
            req.user = verified; 
            return next();
        } catch (err) {
            return next();
        }
}

module.exports = NoAuthMiddleWare