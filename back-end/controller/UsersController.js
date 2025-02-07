const db = require('../config/connectDatabase')
const bcrypt = require('bcrypt');
const { generateToken, generateRefreshToken} = require('../service/JWTtokenGeneration');
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const axios =require('axios')
const { getChatsByUserId, getImagesByChatId } = require('../service/UserService');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const admin = require('../config/firebaseConfig')

// get all users api - api/v1/users/list

exports.getUsersList = async (req, res, next) => {
    try{
        const [users] = await db.execute('SELECT * FROM users');

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            users
        })
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the users",
            error: error.message
        });
    }
}


// get user by id api - api/v1/user/:id

exports.getSingleUser = async (req, res, next)=> {
    const userId = req.params.id;
    // console.log(userId);

    try{
        const [rows] = await db.execute(
            'SELECT * FROM Guest_Image_Limits WHERE id = ?', 
            [userId]
        );
        // console.log(rows[0]);
        if(rows.length > 0){
            res.status(200).json({
                success: true,
                message: "User retrieved successfully",
                user: rows[0] 
            });
        } else {
            res.status(404).json({
                success: false,
                message: `No user found with ID ${userId}`
            });
        }
    } 
    catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the user",
            error: error.message
        });
    } 
} ;



// user register api - api/v1/users/register

exports.userRegister = async(req, res, next) => {
    const {username, password, age, email, confirmPassword, role='user'} = req.body
    try{

        if(password != confirmPassword){
            res.status(404).json({success: false, message: "Password do not match"})
            return; 
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const query = `INSERT INTO users (username, password_hash, age, email, role, credits) 
                    VALUES (?,?,?,?,?,?)`;
        const [rows] = await db.execute(query, [username, hashedPassword, age, email, role, 0]) 

        console.log(rows);
 
        res.status(200).json({
            success:  true,
            message: "user registered successfully",
            userId: rows.insertId
        });
    } catch (err) {
        console.error(err);

        if (err.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({ message: 'Invalid foreign key reference' });
        }

        if (err.code === 'ER_DUP_ENTRY') {
           return res.status(409).json({ message: 'user with this email already exist' });
           
        }
        
        if (err.code === 'ER_DATA_TOO_LONG') {
            return res.status(400).json({ message: 'Input value too long' });
        }

        if (err.code === 'ER_BAD_NULL_ERROR') {
            return res.status(400).json({ message: 'Required field is missing' });
        }

        res.status(500).json({
            success: false,
            message: "Error :"+err.sqlMessage ,
        });
    }
};



// user login api - api/v1/user/login

exports.userLogin = async (req, res, next) => {
    try{
        const {email, password} = req.body
        const query = "Select * from users WHERE email = ?"
    
        const [oldUser] = await db.execute(query,[email]);
        const response =null

       
        
        if(oldUser.length==0){
            res.status(404).json({
                message:"user not found"
            })
            return
        }
        if(oldUser[0].register_type!="password"){
            res.status(409).json({
                message:"sign-in with google"
            });
            return
        }
          console.log(oldUser[0].password_hash)
          const isPasswordMatch = await bcrypt.compare(password,oldUser[0].password_hash)
        if(!isPasswordMatch){
            res.status(401).json({
                message:"unAuthorised"
            })
            return
        }

        console.log("test1 "+oldUser)

        const token =generateToken(oldUser[0]) ;
        const refreshToken= await generateRefreshToken(oldUser[0])
        

        let options = {
            maxAge: 1000 * 60 * 60, // expire after 60 minutes
            httpOnly: true, // Cookie will not be exposed to client side code
            sameSite: "none", // If client and server origins are different
            secure: true // use with HTTPS only
        }
        let refreshTokenOptions={
            maxAge: 1000 * 60 * 60 * 24 * 7, // expire after 1 week
            httpOnly: true, // Cookie will not be exposed to client side code
            sameSite: "none", // If client and server origins are different
            secure: true // use with HTTPS only
        }
        console.log("token   :"+token)
        console.log("refresh token 2  "+refreshToken)

        res.cookie( "token", token, options );
        res.cookie("refresh_token",refreshToken,refreshTokenOptions)
        
        res.status(200).json({
            success: true,
            message: "login successfully",
         
            
        });
    } catch(error){
        console.log(error)
    }
}

exports.userLogout= async (req,res,next)=>{
    let  cookies =null   

    try{
    
            const cookies1= cookie.parse(req.headers.cookie)
            cookies=cookies1;
        }
        catch(err){
            res.status(401).json({ message: 'User is already logged out' }) 
            return;
        }

    try{
        
        const refresh_token= cookies.refresh_token

        const decoded_refresh_token = jwt.decode(refresh_token)
        console.log(decoded_refresh_token)
        const query ="DELETE FROM refresh_token where user_id=?"

        const row =await db.execute(query,[decoded_refresh_token.id])
        

        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'Strict' });
        res.clearCookie('refresh_token',{ httpOnly: true, secure: true, sameSite: 'Strict' })
        res.status(200).json({
            message:"succesfully logged out"
        }) 
        return
    }
    catch(err){
        console.log("error loggingout : "+err)
        res.status(400).json({
            error:err
        })
    }   
}

exports.firstTimeVerification = async(req,res,next) => {
    res.status(200).json({
        message: "user with successfull token"
    })
}



exports.getChatsList=async(req,res,next)=>{
    //getting jwt token from cookies
    let cookies =null
    let token =null
    let decodeToken=null
            
    try{
        const cookies1 = cookie.parse(req.headers.cookie)
        cookies=cookies1    
        const token1 = cookies.token
        token= token1
        decodeToken= jwt.decode(token)
    }catch(err){
        console.log(err)
    }

    const {id,username,role}= decodeToken;

    const chatsList= await getChatsByUserId(id)

    if(!chatsList){
        res.status(404).json("error retriving chats List");
        return
    }

    res.status(200).json({
        messsage:"retrived chats list successfully",
        data:chatsList
    })
}

exports.getChatsData=async(req,res,next)=>{

    const {chat_id}=req.body;

    let cookies =null
    let token =null
    let decodeToken=null
            
    try{
        const cookies1 = cookie.parse(req.headers.cookie)
        cookies=cookies1    
        const token1 = cookies.token
        token= token1
        decodeToken= jwt.decode(token)
    }catch(err){
        console.log(err)
    }

    const {id,username,role}= decodeToken;
    //getting jwt token from cookies
  

    const chatData=await getImagesByChatId(chat_id,id)


    res.status(chatData.status).json({
        message:chatData.message
    })
}

exports.emailOtpRequest = async(req, res, next) => {

    const {email} = req.body;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        } 
    });

    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); ///expires at 5 minutes
    let userdata=null;

    try{
        const query = "SELECT * FROM users WHERE email = ?"
        const [rows] = await db.execute(query, [email])
        console.log(rows)
        userdata=rows

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Email is not registered. Please sign up first."
            });
            return
        }
    } catch(err){
        console.error(err)
        res.status(500).json({
            messgae: "error verifying user"
        })
        return
    }

    if(userdata[0].register_type!="password"){
        res.status(409).json({
            message:"sign-in with google"
        });
        return
    }

    try{
        const query = 'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)'
        const rows = await db.execute(query, [email, otp, expiresAt])

    } catch (err) {

        if (err) 
            return res.status(500).json({
            message: 'Database error', error: err 
        });
    }

    try{

        const mailOptions = {
                       from: process.env.EMAIL_USER,
                       to: email,
                       subject: 'Your OTP for Login',
                       text: `Your OTP is ${otp}. It expires in 5 minutes.`
                   };
       
                  await transporter.sendMail(mailOptions)
                   console.log('otp has sent')
    } catch (err){
        console.error(err);
    }

    res.status(200).json({
        success: true,
        message: "otp sended"
    });
}

exports.verifyEmailOtp = async(req, res, next) => {
    const {email, otp} = req.body

    const query = "SELECT * FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1"

    try{ 
        const [rows] = await db.execute(query, [email])
        
        if (rows.length === 0) {
            return res.status(400).json({ message: 'No OTP found for this email. Please request a new one.' });
        }

        const dbOtp = rows[0].otp;
            const expiresAt = new Date(rows[0].expires_at);

            if (expiresAt < new Date()) {
                return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
            }

            if (dbOtp != otp) {
                return res.status(400).json({ message: 'Invalid OTP' });
            } 
                const queryUser = "SELECT * from users WHERE email = ?"
                const [userRows] = await db.execute(queryUser, [email])
                console.log(userRows)
                

                const token = generateToken(userRows[0]);
                const refreshToken = generateRefreshToken(userRows[0]);


                res.cookie("token", token, {
                    httpOnly: true,  
                    secure: true,    
                    sameSite: "none",
                    maxAge: 1000 * 60 * 60 
                });

                res.cookie("refresh_token", refreshToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 7, 
                    httpOnly: true, 
                    sameSite: "none", 
                    secure: true 
                });
            
                return res.status(200).json({
                    success: true,
                    message: "OTP verified successfully. You are now logged in.",
                    token
                });

    }catch(err){
        console.error(err)
        res.status(500).json({
            message: "error verifying otp"
        })
    }


    res.status(200).json({
        success: true,
        message: "otp verified succesfully"
    })
}

exports.VerifyGoogleSignInToken = async(req, res, next) => {
    try {
        const token = req.headers['authorization']?.split("Bearer ")[1] || req.body.token;

        console.log("Received Token:", token); // Debugging

        if (!token) {
            return res.status(400).json({ success: false, message: "Token is missing!" });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);   
        console.log("decoded token")
        console.log(decodedToken)         //decodes the generated id from firebase on frontend
        const userid = decodedToken.uid;
        const useremail = decodedToken.email;

        const query = "SELECT * FROM users WHERE email = ?"
        const [rows] = await db.execute(query, [useremail]);

        console.log("logging in user")
        console.log(rows)

        if(rows.length==0){
            try{
                const insertQuery = "INSERT INTO users (email,username,age,password_hash,register_type) VALUES (?,?,?,?,CAST(? AS CHAR))";

                const [response] = await db.execute(insertQuery, [useremail,decodedToken.name,0," ","google-sign-in"]);
                console.log(response);

                const user={
                    user_id: response.insertId,
                    username: decodedToken.name,
                    role: "user"
                }
                
                const token = generateToken(user);
                const refreshToken = generateRefreshToken(user);

                res.cookie("token", token, {
                    httpOnly: true,  
                    secure: true,    
                    sameSite: "none",
                    maxAge: 1000 * 60 * 60
                });

                res.cookie("refresh_token", refreshToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 7, 
                    httpOnly: true, 
                    sameSite: "none", 
                    secure: true 
                });


                    res.status(200).json({
                        success: true,
                        message: "New user created and logged in"
                    })
                    return
            }catch (err){
                console.error("error registering user")
                console.error(err)
                res.status(500).json({
                    success: false,
                    message: "error registering user"
                })
                return
            }  
        }

        if(rows[0].register_type!="google-sign-in"){
            res.status(409).json({
                message:"sign-in with email and password"
            });
            return
        }

        if(rows.length > 0){
            const token = generateToken(rows[0]);
            const refreshToken = generateRefreshToken(rows[0])

            res.cookie("token", token, {
                httpOnly: true,  
                secure: true,    
                sameSite: "none",
                maxAge: 1000 * 60 * 60 
            });

            res.cookie("refresh_token", refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7, 
                httpOnly: true, 
                sameSite: "none", 
                secure: true 
            });

            console.log('user logged in')
            res.status(200).json({
                message:"user logged in"
            })
            return 
        }
            
            // db.query(insertQuery, [uid, email], (err) => {
            //     if (err) {
            //         return res.status(500).json({ success: false, message: "Database error", error: err });
            //     }
            //     res.json({ success: true, message: "New user created and logged in", user: { uid, email } });
            // });
        


    } catch (error) {
        console.error("Firebase Token Verification Error:", error);
        res.status(401).json({ success: false, message: "Invalid Token", error });
    }
};