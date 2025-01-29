const jwt = require('jsonwebtoken');
const db = require('../config/connectDatabase')
const cookie = require("cookie")

exports.generateToken = (user) => {
    const payload = {
        id: user.user_id,
        username: user.username,
        role: user.role,
    };

    const secretKey = process.env.JWT_SECRET_KEY || '80676218f9466f7e32dd5e6ba01a9bddb29d624d45e67269362a49a66c1b38e7e2387893f17ae2374f4740c490fc0fc6a449510da9ebdc3906f9236192ab2bf4'
    const options = {
        expiresIn:'1h',
    };

    const token = jwt.sign(payload, secretKey, options);
    return token;
};

// const user = {id}
exports.verifyToken = (token) => {

    if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

    const secretKey = process.env.JWT_SECRET_KEY;
    try {
        const verified = jwt.verify(token, secretKey);
        req.user = verified; 
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid token.' });
    }
};  



const refreshTokens = []; 
exports.generateRefreshToken = async (user) => {
    const secretKey = process.env.REFRESH_TOKEN_SECRET ||   'refresh-secret-key';
    const payload = {
        id: user.user_id,
        username: user.username,
        role: user.role,
    };
    const refreshToken = jwt.sign(payload, secretKey, { expiresIn: '7d' });
    console.log("refresh token"+refreshToken) // Valid for 7 days
    const row =addRefreshToken(user,refreshToken)
    return refreshToken; 

};

exports.refreshToken = async (req, res) => {
       const cookies = cookie.parse(req.headers.cookie||"")
        const token = cookies.refresh_token


    if (!token || !refreshTokens.includes(token)) {
        return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY || 'refresh-secret-key');
        
        console.log("refresh token "+user)
        const accessToken = generateToken({ id: user.user_id, username: user.username });
        
        let options = {
            maxAge: 1000 * 60 * 60, // expire after 60 minutes
            httpOnly: true, // Cookie will not be exposed to client side code
            sameSite: "none", // If client and server origins are different
            secure: true // use with HTTPS only
        }
        res.cookie("token",accessToken,options)
        res.status(200).json({message:"new access token has been generted with refresh token"})
    } catch (err) {
        res.status(403).json({ message: 'Invalid refresh token.' });
    }
};

const addRefreshToken= async(user, refreshToken)=> {
    let expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);
    const formattedExpiresAt = expires_at.toISOString().slice(0, 19).replace('T', ' ');
    console.log("Expires At:", expires_at);

    try {
        const query = `INSERT INTO refresh_token (user_id, refresh_token,expires_at) VALUES (?, ?, ?)`;
        // const query = "SELECT * from users WHERE user_id =?";

        console.log('Query:', query);
        console.log('Parameters:', [user.user_id, refreshToken, expires_at]);

        const [rows] = await db.execute(query, [user.user_id, refreshToken,formattedExpiresAt]);
        // const [rows] = await db.execute(query,[30]);
        console.log("Refresh token added successfully:", rows);
        return rows;
    } catch (err) {
        console.error("Add refresh token error:", err.message); // Log the error message
        throw new Error("Failed to add refresh token to the database."); 
    }
}