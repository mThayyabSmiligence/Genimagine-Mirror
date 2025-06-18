const express = require('express');
const { getCreditPackagesController, getCreditTopUpController } = require('../controller/CreditController');
const { getAllExploreImagesController, getExploreImageByIdController, ViewExploreImageController, getExploreImageByUserIdController } = require('../controller/ExploreController');
const { getUserDataByIdController, getUserNameByIdController, getAllModelsController, getAllAspectRatiosController, getAllQualityLevelsController, getAllStylesController, getImageSettingsController, getResizedHeightWidthController, getModelByIdController, getStyleNameById } = require('../controller/UsersController');
const { checkdimension, checkmodel } = require('../controller/CheckController');
const { getAspectRatioShape, getResizedAspectRatio, getResizedHeightWidth } = require('../service/UserService');
const { getModelById } = require('../service/IGSettingService');
const router = express.Router();

router.route('/get-packages').get(getCreditPackagesController);


router.route('/explore').get(getAllExploreImagesController)
router.route("/explore/:user_id").get(getExploreImageByUserIdController)
router.route(`/explore/image/:published_id`).get(getExploreImageByIdController)

router.route('/explore/:published_id/view').post(ViewExploreImageController)
router.route('/user/:user_id').get(getUserNameByIdController)

router.route("/models").post(getAllModelsController);
router.route('/model/:id').post(getModelByIdController);
router.route("/aspect-ratios").post(getAllAspectRatiosController);
router.route("/quality-levels").post(getAllQualityLevelsController);
router.route("/styles").post( getAllStylesController);
router.route("/aspect-ratio-shape").post( getAspectRatioShape);

// router.route("/stylename").post(getStyleNameById)


router.route("/get-image-settings").post(getImageSettingsController);

router.route("/resize-aspect-ratio-shape").post(getResizedHeightWidthController);

router.route('/dimension_check').get(checkdimension)
router.route('/model_check').get(checkmodel)


module.exports = router;