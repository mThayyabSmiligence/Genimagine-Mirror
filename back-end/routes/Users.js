const express = require('express')
const { getUsersList, getSingleUser, userLogout } = require('../controller/UsersController')
const router = express.Router();

router.route('/list').get(getUsersList);
router.route('/id/:id').get(getSingleUser);


module.exports = router;