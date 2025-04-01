const express = require('express');
const { banUserController, unbanUserController } = require('../controller/UsersController');
const router = express.Router();

router.route('/:user_id/ban').post(banUserController);
router.route('/:user_id/unban').post(unbanUserController);

module.exports = router;