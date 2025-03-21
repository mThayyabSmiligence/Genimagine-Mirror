
const express= require('express');
const CryptoJS = require('crypto-js')
const db = require('../config/connectDatabase');
const bcrypt = require('bcrypt');
const cookie = require("cookie");
const { generateToken, generateRefreshToken, generateTokenWithRefreshToken} = require('../service/JWTtokenGeneration');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const { use } = require('../routes/AuthenticationRoute');
const { sendMail, sendMailHTML } = require('../service/emailService');
const crypto = require('crypto')
const admin = require('../config/firebaseConfig');
const { generateUserVerificationToken, verifyUserWithVerificationToken, generateTestEmailService } = require('../service/AuthenticationService');
const { deleteUser, getUserById } = require('../service/UserService');

// user register api - api/v1/users/register

const frontendBaseUrl= process.env.FRONTEND_BASE_URL;

exports.userRegister = async(req, res, next) => {
    const {username, password, dob, email, confirmPassword, role='user'} = req.body

    

    const today = new Date();
    const dobDate=new Date(dob)
    const age = today.getFullYear() - dobDate.getFullYear() - ((today.getMonth() < dobDate.getMonth() || (today.getMonth() === dobDate.getMonth() && today.getDate() < dobDate.getDate()))? 1 : 0);
    console.log(age);
    try{
        

        if(password != confirmPassword){
            res.status(404).json({success: false, message: "Password do not match"})
            return; 
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const query = `INSERT INTO users (username, password_hash, age, email, role, credits,dob) 
                    VALUES (?,?,?,?,?,?,?)`;
        const [rows] = await db.execute(query, [username, hashedPassword, age, email, role, 0,dob]) 

        console.log(rows);
        const user_id = rows.insertId
       

        const verification_token= await generateUserVerificationToken(user_id,email)
        if (!verification_token){
            const rows = await deleteUser(user_id)

            return res.status(500).json({
                success:  false,
                message: "error registering user"
            });
        }

        

        const VerificationLink=`${frontendBaseUrl}/user-email-verification/${verification_token}`

        const subject = "Verify Your Email – Genimagine"

        const htmlContent= `
        <p>Dear <strong>${username}</strong>,</p>
        <p>Thank you for signing up for <strong>Genimagine</strong>! To complete your registration and start generating stunning images, please verify your email by clicking the link below:</p>
        <p><a href="${VerificationLink}" style="color: #007bff; text-decoration: none; font-weight: bold;">Verify My Email</a></p>
        <p>If you did not sign up for Genimagine, please ignore this email. The link will expire in 1 hour after register request for security reasons.</p>
        <p>Happy creating!<br>
        <strong>Genimagine Team</strong></p>
    `

        const emailResponce = await sendMailHTML(email,subject,htmlContent)

        if(!emailResponce){
        return res.status(500).json({
                success:false,
                message:"error sending verification link to email"
            })
            
        }
 
        res.status(200).json({
            success:  true,
            message: "verification link sent successfully",
            // verification_token:verification_token
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

exports.verifyUser=async(req,res)=>{
    const {verification_token} = req.params
    console.log(verification_token)

    const response = await verifyUserWithVerificationToken(verification_token)
    if(response.status === 404){
        res.status(response.status).json({
            message: "verification token expired"
        });
        return;
    }
    if(response.status ===500){
        res.status(response.status).json({
            message: "server error"
        });
        return;
    }
    if(response.status ===200){
        res.status(response.status).json({
            message: "user verified successfully",
            user_id: response.user_id
        })
        return
    }
}

// user login api - api/v1/user/login

exports.userLogin = async (req, res, next) => {
    try{
        const {email, password} = req.body
        const query = "Select * from users WHERE email = ?"
    
        let [oldUser] = await db.execute(query,[email]);
        const response =null

        const test_email=email.split("@")[1]
        console.log("Test Email", test_email)
        if(test_email=="genimagin.test" && oldUser.length==0){
            const generated_email=await generateTestEmailService(email,password)
            if(generated_email==null){
                res.status(500).json({
                    message:"error generating test email"
                });
                return
            }
            oldUser=generated_email;
        }

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
        if(oldUser[0].is_verified==0){
            res.status(401).json({
                message:"user not verified"
            })
            return
        }
          console.log(oldUser[0].password_hash)
          const isPasswordMatch = await bcrypt.compare(password,oldUser[0].password_hash)
        if(!isPasswordMatch){
            res.status(401).json({
                message:"incorrect passoword or  username"
            })
            return
        }
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

        res.cookie( "token", token, options );
        res.cookie("refresh_token",refreshToken,refreshTokenOptions)
        
        res.status(200).json({
            success: true,
            message: "login successfully",
            user_data:{

                user_id: oldUser[0].user_id,
                username: oldUser[0].username,
                email: oldUser[0].email,
                role: oldUser[0].role,
                age: oldUser[0].age,
                credits: oldUser[0].credits,
                register_type: oldUser[0].register_type,
                free_generation_count: oldUser[0].free_generation_count
            }         
            
        });
    } catch(error){
        console.log(error)
    }9
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

        
        if (rows.length == 0) {
            return res.status(400).json({
                success: false,
                message: "Email is not registered. Please sign up first."
            });
            
        }
        if(rows[0].is_verified==0){
            res.status(401).json({
                message:"user not verified"
            }) 
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
        const query = `SELECT * FROM  otp_verifications
                        WHERE email = ? 
                        AND created_at >= NOW() - INTERVAL 2 MINUTE 
                        ORDER BY created_at DESC 
                        LIMIT 1;`
        
        const [rows] = await db.execute(query, [email]);
        if(rows.length > 0){
            return res.status(400).json({
                message: "to resend the opt you have to 2 mins after last request."
            });
        }

    }catch(err){
        console.error(err)
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
            return res.status(400).json({ message: 'No OTP found for this email. Please request a new opt.' });
        }

        const dbOtp = rows[0].otp;
            const expiresAt = new Date(rows[0].expires_at);

            if (expiresAt < new Date()) {
                return res.status(400).json({ message: 'OTP expired. Please request a new opt.' });
            }

            if (dbOtp != otp) {
                return res.status(400).json({ message: 'Invalid OTP' });
            } 
                const queryUser = "SELECT * from users WHERE email = ?"
                const [userRows] = await db.execute(queryUser, [email])
                console.log(userRows)
                

                const token = generateToken(userRows[0]);
                const refreshToken =await generateRefreshToken(userRows[0]);


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
                    user_data:{

                        user_id: userRows[0].user_id,
                        username: userRows[0].username,
                        email: userRows[0].email,
                        role: userRows[0].role,
                        age: userRows[0].age,
                        credits: userRows[0].credits,
                        register_type: userRows[0].register_type,
                        free_generation_count: userRows[0].free_generation_count
                    }    
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
                const refreshToken =await generateRefreshToken(user);

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

                    const userData =await getUserById(response.insertId)

                

                    res.status(200).json({
                        success: true,
                        message: "New user created and logged in",
                        token:token,
                        refreshToken: refreshToken,
                        user_data:{

                            user_id: userData[0].user_id,
                            username: userData[0].username,
                            email: userData[0].email,
                            role: userData[0].role,
                            age: userData[0].age,
                            credits: userData[0].credits,
                            register_type: userData[0].register_type,
                            free_generation_count: userData[0].free_generation_count
                        }        
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
            const refreshToken =await generateRefreshToken(rows[0])

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
                message:"user logged in",
                token:token,
                refreshToken: refreshToken,
                user_data:{

                    user_id: rows[0].user_id,
                    username: rows[0].username,
                    email: rows[0].email,
                    role: rows[0].role,
                    age: rows[0].age,
                    credits: rows[0].credits,
                    register_type: rows[0].register_type,
                    free_generation_count: rows[0].free_generation_count
                }        
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




exports.forgotPassword=async(req,res)=>{

    const {email}= req.body;

    let user=null;

    try{
        const query = "Select * from users where email=?"

        const [rows]= await db.execute(query,[email])
        user=rows
        if(user.length==0){
            return res.status(404).json({
                message:"user not found"
            })
        }

    }catch(err){
        console.error("error fetching users",err)
        res.status(200).json({
         message:"this reset password route"
        })

    }

    try{


        const query = 'select * from password_reset_tokens where email =? and expires_at > NOW()'

        const [rows]= await db.execute(query,[email])

        if(rows.length >0){
            return res.status(402).json({
                message:"link to reset passowrd has been already sent to your email , you have to wait 15 mins after last reset password request"
            }) 
            
        }
        console.log(rows)
    }catch(err){
        console.error("error in checking validity of token with database", err)

        res.status(500).json({
            message:"error checking if reset link already sent"
        })
        return
    }
    

    if(user[0].register_type!="password"){
        return res.status(409).json({
            message:"this email is registred using google signin option so try signing in with google sign-in option"
        })
        
    } 

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; 

    try{
        
        const query ='INSERT INTO password_reset_tokens (email, reset_token, expires_at)VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE));'

        const [rows] = await db.execute(query,[email,resetTokenHash])

        console.log("reset token hash is stored in table")
        console.log(rows)
    }catch(err){
        console.error("error in storing reset token hash to table", err)

        res.status(500).json({
            message:"error in storing rest token into table"
        })
        return
    }  

    const encrypted = CryptoJS.AES.encrypt(email, "031ebf4c74af22bb6ec5eeaf8efa4d99acd3b9d4d7463fd07a8bc2c91f7bab7e").toString();
    const encryptedEmail= encodeURIComponent(encrypted); 


    const resetLink=`${frontendBaseUrl}/reset-password/${encryptedEmail}/${resetToken}`

    const subject = "rest password link for your account on Genimagine"

    const htmlContent= `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`

    const emailResponce = await sendMailHTML(email,subject,htmlContent)

    if(!emailResponce){
       return res.status(500).json({
            success:false,
            message:"error restting password"
        })
        
    }

    res.status(200).json({
        success:true,
        message:"reset password link sent to email",
        email_Response :emailResponce,
        resetToken:resetToken
    })
}

exports.resetPassword=async(req,res)=>{
    const {resetToken}= req.params
    const {new_password}= req.body;

    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    

    if(!resetToken){
        return res.status(401).json({
            message:"no reset token provided"
        })
    }
    if(!new_password){
        return res.status(402).json({
            message:"provide a password to reset the old password"
        })
    }



    const password_hash = await bcrypt.hash(new_password, 10)
    let email=null;

    try{


        const query = 'select * from password_reset_tokens where reset_token =? and expires_at > NOW()'

        const [rows]= await db.execute(query,[resetTokenHash])

        if(rows.length ==0){
            return res.status(401).json({
                message:"the reset passoword link is expired"
            })
        }
        console.log(rows)
        email=rows[0].email
    }catch(err){
        console.error("error in checking validity of token with database", err)

        res.status(500).json({
            message:"error in checking validity of token with database "
        })
        return
    }

    try{ 
        const query = "update users set password_hash = ? where email = ?"

        const [rows]= await db.execute(query,[password_hash,email])
    }catch(err){
        console.error("error storing new passorwd in database", err)

        res.status(500).json({
            message:"error storing new password in database"
        })
        return
    }

    res.status(200).json({
        message:"your password has been reseted successfully"
    })
}

exports.testSendMail=async(req,res)=>{
       const emailSent=await sendMail('thayyab15@gmail.com','test send email','test content')

       res.status(200).json({message:emailSent})
}


exports.generateTokenWithRefreshTokenController = async (req, res) => {
    try {
        // Get the refresh token from the cookie
        const cookies= cookie.parse(req.headers.cookie)
        const token = cookies.token
        const refreshToken= cookies.refresh_token
        if (!refreshToken) {
            return res.status(403).json({ message: "Refresh token is missing." });
        }

        // Generate new access token using the refresh token
        const newAccessToken = await generateTokenWithRefreshToken(refreshToken);

        if (!newAccessToken) {
            return res.status(401).json({ message: "Invalid or expired refresh token." });
        }

        let options = {
            maxAge: 1000 * 60 * 60, // expire after 60 minutes
            httpOnly: true, // Cookie will not be exposed to client side code
            sameSite: "none", // If client and server origins are different
            secure: true // use with HTTPS only
        }
        // Set the new access token in cookies
        res.cookie("token", newAccessToken, options);

        return res.json({ message: "Token refreshed successfully" });

    } catch (error) {
        console.error("Refresh token error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};