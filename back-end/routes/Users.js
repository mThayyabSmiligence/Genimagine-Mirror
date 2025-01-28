const express = require('express')
const { getUsersList, getSingleUser, userRegister, userLogin, userLogout } = require('../controller/UsersController')
const router = express.Router();

router.route('/users/list').get(getUsersList);
router.route('/user/id/:id').get(getSingleUser);
router.route('/users/register').post(userRegister);
router.route('/user/login').post(userLogin)
router.route('/user/logout').get(userLogout)

module.exports = router;