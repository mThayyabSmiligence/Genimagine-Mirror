const express = require('express');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },


});

exports.sendMail=async(to,subject,content)=>{
    try{

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject ,
            text: content
        };
        
        return await transporter.sendMail(mailOptions) 
    }catch(err){
        console.error("error sending mail",err)
        return false;
    }
}
exports.sendMailHTML=async(to,subject,content)=>{
    try{

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject ,
            html: content
        };
        
        return await transporter.sendMail(mailOptions) 
    }catch(err){
        console.error("error sending mail",err)
        return false;
    }
}


