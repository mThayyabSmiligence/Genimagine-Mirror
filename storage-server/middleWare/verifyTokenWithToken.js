const jwt = require('jsonwebtoken');
const cookie = require("cookie")


// const user = {id}
const verifyTokenWithToken = (req, res, next)=> {

    let jwtToken =null;

    try{

        const cookies= cookie.parse(req.headers.cookie)
        const token = cookies.token
        jwtToken= token
    }
    catch(err){
        res.status(401).json({ message: 'Access Denied. No token provided.' }) 
        return;
    }
    
    if (!jwtToken) return res.status(401).json({ message: 'Access Denied. No token provided.' });

    const secretKey = process.env.JWT_SECRET_KEY;
    try {
        const verified = jwt.verify(jwtToken, secretKey);
        req.user = verified; 
        next();
    } catch (err) {
        
        res.status(401).json({ message: 'Invalid token.' });
    }
}; 

module.exports = verifyTokenWithToken