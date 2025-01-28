const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors')

const cookie = require("cookie")

const cookieParser = require('cookie-parser')
const db = require('./config/connectDatabase')
const usersRouter = require('./routes/Users')
const generateImageRouter = require('./routes/GenerateImage') 
const crypto = require('crypto');
const jwtRouter= require("./routes/JWTRoute")

dotenv.config({path: path.join(__dirname, 'config', 'config.env')})

// middleware's
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
};
app.use( cors(corsOptions) );
app.use(express.json());
app.use(cookieParser());
// middleware's

// api's --start
app.use('/api/v1',usersRouter);
app.use('/api/v1',generateImageRouter);
app.use('/api/v1',jwtRouter)

// api's --end


// http only cookie test

app.get( "/get-token", ( req, res ) => {
    // Our `token` cookie should be parsed into `req.cookies.token`
    console.log( "🍪", req.cookies );
    
    // Configure the `token` HTTPOnly cookie
    let options = {
        maxAge: 1000 * 60 * 60, // expire after 60 minutes
        httpOnly: true, // Cookie will not be exposed to client side code
        sameSite: "none", // If client and server origins are different
        secure: true // use with HTTPS only
    }

    const token = "abcd.123456.xyz"; // dummy JWT token
    res.cookie( "token", token, options );
    res.send( "🍪 has been set!" );
});

app.post('/post-token', (req, res) => {
    const cookies = cookie.parse(req.headers.cookie||"")
    const token = cookies.token
    console.log(token)
    console.log(typeof(token))
})

app.listen(process.env.PORT,() => {
    console.log(`server listening to port ${process.env.PORT} in ${process.env.NODE_ENV}`)
    const secretKey = crypto.randomBytes(64).toString('hex');
    console.log('Generated Secret Key:', secretKey);
});