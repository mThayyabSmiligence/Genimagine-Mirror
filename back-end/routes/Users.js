const express = require('express')
const { getUsersList } = require('../controller/UsersController')
const router = express.Router();

router.route('/users/list').get(getUsersList);
router.route('/user/:id').get();

module.exports = router;