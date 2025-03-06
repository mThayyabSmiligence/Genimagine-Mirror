require('dotenv').config(); 

module.exports = {
    jwtSecret: process.env.JWT_SECRET_KEY,
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    ALLOWERD_ORGIN_1:process.env.ALLOWERD_ORGIN_1,
    ALLOWERD_ORGIN_2:process.env.ALLOWERD_ORGIN_2,
    STORAGE_SERVER_BASE_URL:process.env.STORAGE_SERVER_BASE_URL,
};
 
