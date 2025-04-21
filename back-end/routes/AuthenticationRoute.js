const express = require('express')

const { forgotPassword, userRegister, userLogin, emailOtpRequest, verifyEmailOtp, VerifyGoogleSignInToken, userLogout , resetPassword, testSendMail, verifyUser} = require('../controller/AuthenticationController');
const { checkUserStatus } = require('../middle_ware/RestrictBannedUser');

const router = express.Router();

router.route("/login").post(userLogin)
router.route("/email-otp-request").post(emailOtpRequest)
router.route('/email-otp-verify').post(verifyEmailOtp)
router.route('/verify-google-token').post((req, res, next) => {
    console.log("Received Token: ", req.body.token);    
    next();
}, VerifyGoogleSignInToken);
router.route('/register').post(userRegister);
router.route('/verify-user/:verification_token').get(verifyUser)
router.route('/logout').get(userLogout)

router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:resetToken').post(resetPassword)
router.route('/send-email').post(testSendMail)


module.exports=router; 