const express = require('express')
const { getUsersList, getSingleUser, userLogout, firstTimeVerification } = require('../controller/UsersController')
const router = express.Router();

router.route('/list').get(getUsersList);
router.route('/id/:id').get(getSingleUser);
router.route('/verify-token').get(firstTimeVerification);


module.exports = router;