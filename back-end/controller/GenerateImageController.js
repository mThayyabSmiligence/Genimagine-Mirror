const express = require('express')
const { GuestUserHandler } = require('../service/GuestUserService')
const cookie = require('cookie')

exports.generateImageApiCall = async(req, res, next) => {
    console.log("generate image is running")
    
    // console.log(req.headers.cookie)
    const cookies = cookie.parse(req.headers.cookie||"")
    // console.log(cookies)
    const token = cookies.token
    if(!token) {
        const canGenerate=GuestUserHandler(req.ip);
    } else {
        console.log(token);
    }
    res.send("this is generate image api")
} 

