const express = require('express');
const { getCreditPackagesController } = require('../controller/CreditController');
const { getAllExploreImagesController, getExploreImageByIdController, ViewExploreImageController, getExploreImageByUserIdController } = require('../controller/ExploreController');
const { getUserDataByIdController } = require('../controller/UsersController');
const router = express.Router();

router.route('/get-packages').get(getCreditPackagesController);

router.route('/explore').get(getAllExploreImagesController)
router.route("/explore/:user_id").get(getExploreImageByUserIdController)
router.route(`/explore/image/:published_id`).get(getExploreImageByIdController)

router.route('/explore/:published_id/view').post(ViewExploreImageController)
router.route('/user/:user_id').get(getUserDataByIdController)

module.exports = router;