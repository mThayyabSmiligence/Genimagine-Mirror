const express = require('express');
const app = express();

const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors')

const cookie = require("cookie")

const cookieParser = require('cookie-parser')
const db = require('./config/connectDatabase')
const fileUpload = require('express-fileupload');
const usersRouter = require('./routes/Users')
const generateImageRouter = require('./routes/GenerateImage') 
const AuthenticationRoutes = require('./routes/AuthenticationRoute')
const jwtRouter= require("./routes/JWTRoute");
const NoAuthRouter= require("./routes/NoAuthRoute")
const AdminRouter = require("./routes/AdminRoute");
const ModeratorRouter = require('./routes/ModeratorRoute');
// const TestOpenAIRouter = require('./routes/TestOpenAIRoute');

const crypto = require('crypto'); 
const verifyToken= require('./middle_ware/VerifyToken');
const verifyRefreshToken = require('./middle_ware/VerifyRefreshToken');
const verifyAdminToken = require('./middle_ware/verifyAdminToken');
const verifyModeratorToken = require('./middle_ware/verifyModeratorToken');
const { checkUserStatus } = require('./middle_ware/RestrictBannedUser');
const NoAuthMiddleWare = require('./middle_ware/NoAuthMiddleWare');
const { sequelize } = require("./models")    



dotenv.config({path: path.join(__dirname, 'config', 'config.env')})
app.use(express.static(path.join(__dirname, 'public')));


const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

sequelize.authenticate()
  .then(() => console.log("✅ Sequelize connected"))
  .catch(err => console.error("❌ Sequelize error: ", err));

sequelize.sync({ alter: false })  
  .then(() => console.log("✅ Sequelize models are synced"))
  .catch(err => console.error("❌ Sequelize sync error: ", err));

// Make io available globally (for cron jobs & routes)
global.io = io;

// middleware's
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next(); 
});
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
};
app.use( cors(corsOptions) );
app.use(express.json());
app.use(cookieParser());

// app.use(fileUpload({
//   createParentPath: true, // auto create folders
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// }));

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/outputs', express.static(path.join(__dirname, 'public', 'outputs')));

// middleware's

// api's --start
app.use('/api/v1/user',verifyToken,checkUserStatus,usersRouter);
app.use('/api/v1', generateImageRouter);
app.use('/api/v1/refresh-token',verifyRefreshToken,jwtRouter)   
app.use('/api/v1/auth',AuthenticationRoutes) 
app.use('/api/v1/no-auth',NoAuthMiddleWare,NoAuthRouter)


// moderator routes
app.use('/api/v1/moderator',verifyModeratorToken,ModeratorRouter);
app.use('/api/v1/admin',verifyAdminToken,AdminRouter);

// api's --end


io.on('connection', (socket) => {
    console.log(' User connected:', socket.id);

    socket.on('joinUserRoom', (userId) => {
        socket.join(`user_${userId}`);
        console.log("Socket rooms after join:", socket.rooms);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// cron jobs schedulers
require('./scheduler/suspensionChecker');
require('./scheduler/PlanValidityChecker'); 
require('./scheduler/scheduleImageGeneration');


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
    console.log("token ",token);
})

server.listen(process.env.PORT,() => {

    console.log(`server listening to port ${process.env.PORT} in ${process.env.NODE_ENV}`)


// // Generate a 32-byte (256-bit) secret key
// const secretKey = crypto.randomBytes(32).toString("hex");

// console.log("Secret Key:", secretKey);

// const secretKey = crypto.randomBytes(16).toString('hex');

// console.log('Generated Secret Key:', secretKey);
});

