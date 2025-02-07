const express= require('express')

exports.forgotPassword=async(req,res)=>{
    res.status(200).json({
        message:"this is forgot password route"
    })
}