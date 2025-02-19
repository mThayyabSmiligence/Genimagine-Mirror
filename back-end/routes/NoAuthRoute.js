const express = require('express');
const { getCreditPackagesController } = require('../controller/CreditController');
const { getAllExploreImagesController, getExploreImageByIdController } = require('../controller/ExploreController');
const router = express.Router();

router.route('/get-packages').get(getCreditPackagesController);

router.route('/explore').get(getAllExploreImagesController)
router.route(`/explore/:published_id`).get(getExploreImageByIdController)

module.exports = router;