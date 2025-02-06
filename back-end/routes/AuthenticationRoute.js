const express = require('express')
const {userLogin,userRegister,userLogout, emailOtpRequest, verifyEmailOtp} = require('../controller/UsersController')
const router = express.Router();

router.route("/login").post(userLogin)
router.route("/email-otp-request").post(emailOtpRequest)
router.route('/email-otp-verify').post(verifyEmailOtp)
router.route('/register').post(userRegister);
router.route('/logout').get(userLogout)

module.exports=router;