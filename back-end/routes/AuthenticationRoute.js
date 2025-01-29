const express = require('express')
const {userLogin,userRegister,userLogout} = require('../controller/UsersController')
const router = express.Router();

router.route("/login",).post(userLogin)
router.route('/register').post(userRegister);
router.route('/logout').get(userLogout)

module.exports=router;