require('dotenv').config(); 

module.exports = {
    jwtSecret: process.env.JWT_SECRET_KEY,
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV
  };
 
