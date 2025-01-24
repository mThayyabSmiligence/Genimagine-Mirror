const express = require('express');
const cookie = require('cookie');

const app = express();
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const { type } = require('os');
dotenv.config({path: path.join(__dirname, 'config', 'config.env')})

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
};
app.use( cors(corsOptions) );

app.use(cookieParser());

app.get( "/get-token", ( req, res ) => {
    // Our `token` cookie should be parsed into `req.cookies.token`
    console.log( "🍪", req.cookies );
    
    // Configure the `token` HTTPOnly cookie
    let options = {
        maxAge: 1000 * 60 * 15, // expire after 15 minutes
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
    console.log(type(token))
})

app.listen(process.env.PORT,() => {
    console.log(`server listening to port ${process.env.PORT} in ${process.env.NODE_ENV}`)
});