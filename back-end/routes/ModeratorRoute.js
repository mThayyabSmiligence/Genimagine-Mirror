const express = require('express');
const { banUserController, unbanUserController, suspendUserController, unsuspendUserController, warnUserController, deleteUserController } = require('../controller/UsersController');
const router = express.Router();
router.route('/:user_id/ban').post(banUserController);
router.route('/:user_id/unban').post(unbanUserController);
router.route('/:user_id/suspend').post(suspendUserController);
router.route('/:user_id/unsuspend').post(unsuspendUserController);
router.route('/:user_id/warn').post(warnUserController);
router.route("/:user_id/delete").post(deleteUserController);

module.exports = router;