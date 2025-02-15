const express = require('express');
const { getCreditPackagesController } = require('../controller/CreditController');
const router = express.Router();

router.route('/get-packages').get(getCreditPackagesController);

module.exports = router;