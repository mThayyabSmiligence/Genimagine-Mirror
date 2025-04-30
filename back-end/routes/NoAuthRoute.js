const express = require('express');
const { getCreditPackagesController } = require('../controller/CreditController');
const { getAllExploreImagesController, getExploreImageByIdController, ViewExploreImageController, getExploreImageByUserIdController } = require('../controller/ExploreController');
const { getUserDataByIdController, getUserNameByIdController } = require('../controller/UsersController');
const { checkdimension, checkmodel } = require('../controller/CheckController');
const router = express.Router();

router.route('/get-packages').get(getCreditPackagesController);

router.route('/explore').get(getAllExploreImagesController)
router.route("/explore/:user_id").get(getExploreImageByUserIdController)
router.route(`/explore/image/:published_id`).get(getExploreImageByIdController)

router.route('/explore/:published_id/view').post(ViewExploreImageController)
router.route('/user/:user_id').get(getUserNameByIdController)

router.route('/dimension_check').get(checkdimension)
router.route('/model_check').get(checkmodel)


module.exports = router;