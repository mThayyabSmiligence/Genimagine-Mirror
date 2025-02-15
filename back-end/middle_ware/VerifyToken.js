const jwt = require('jsonwebtoken');
const cookie = require("cookie");
const { generateTokenWithRefreshToken } = require('../service/JWTtokenGeneration');

 
// const user = {id}
const verifyToken =async (req, res, next)=> {

    let jwtToken =null;
    let refreshToken =null

    try{
        console.log(1)
        const cookies= cookie.parse(req.headers.cookie)
        const token = cookies.token
        refreshToken= cookies.refresh_token
        jwtToken= token
        console.log(2)
    }
    catch(err){
        console.log(3)
        res.status(401).json({ message: 'Access Denied. No token provided.' }) 
        return;
    }
    
    if (!jwtToken && !refreshToken) return res.status(401).json({ message: 'Access Denied. No token provided.' });

    const secretKey = process.env.JWT_SECRET_KEY;
    console.log(4)
    try {
        const verified = jwt.verify(jwtToken, secretKey);
        req.user = verified; 
        console.log(5)
        next();
    } catch (err) {
        console.log(6)
        const new_token =await generateTokenWithRefreshToken(refreshToken)
        if(new_token){
            console.log(7)
            let options = {
                maxAge: 1000 * 60 * 60, // expire after 60 minutes
                httpOnly: true, // Cookie will not be exposed to client side code
                sameSite: "none", // If client and server origins are different
                secure: true // use with HTTPS only
            }
            console.log(new_token)
            res.cookie("token",new_token,options)
            console.log(8)
            res.status(401).json({ message:'try again, new token as been issued'});
            return
        }
        console.log(9)
        res.status(401).json({ message: 'Invalid token.' });
            return
    }
}; 

module.exports = verifyToken