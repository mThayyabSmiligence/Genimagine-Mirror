const express= require('express')
const db = require('../config/connectDatabase');
const { use } = require('../routes/AuthenticationRoute');
const bcrypt = require('bcrypt');
const { sendMail, sendMailHTML } = require('../service/emailService');
const crypto = require('crypto')
exports.forgotPassword=async(req,res)=>{

    const {email}= req.body;

    let user=null;

    try{
        const query = "Select * from users where email=?"

        const [rows]= await db.execute(query,[email])
        user=rows

    }catch(err){
        console.error("error fetching users",err)
        res.status(200).json({
         message:"this reset password route"
        })

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


    const resetLink=`http://localhost:3001/rest-password/${resetToken}`

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