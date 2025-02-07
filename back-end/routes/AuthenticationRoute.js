const express = require('express')
const {userLogin,userRegister,userLogout, emailOtpRequest, verifyEmailOtp, VerifyGoogleSignInToken} = require('../controller/UsersController')
const router = express.Router();

router.route("/login").post(userLogin)
router.route("/email-otp-request").post(emailOtpRequest)
router.route('/email-otp-verify').post(verifyEmailOtp)
router.route('/verify-google-token').post((req, res, next) => {
    console.log("Received Token: ", req.body.token);
    next();
}, VerifyGoogleSignInToken);
router.route('/register').post(userRegister);
router.route('/logout').get(userLogout)

module.exports=router;