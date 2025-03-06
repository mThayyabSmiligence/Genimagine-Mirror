const jwt = require('jsonwebtoken');


const {jwtSecret}=  require('../config/config')


const verifyToken=(req,res,next)=>{

    const bearerToken = req.headers['authorization'];
    const token = bearerToken.split(' ')[1];
  

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Use your secret key here
        req.user = decoded; // Store the decoded user info (including user_id) in the request object
        next(); // Proceed to the next middleware or route handler
      } catch (error) {
        return res.status(400).json({ message: 'Invalid token.' });
      }
}

module.exports= {verifyToken}