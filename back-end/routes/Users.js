const express = require('express')
const { getUsersList, getSingleUser } = require('../controller/UsersController')
const router = express.Router();

router.route('/users/list').get(getUsersList);
router.route('/user/:id').get(getSingleUser);

module.exports = router;