const express = require('express');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { getAllModelsController, getModelController, configureModelSettingsController, createModelController, deleteModelController, updateModelController, getQualityLevelAspectRatioForSelect } = require('../controller/IGSettingController');
const { getAllPlansController, getPlanByIdController, createPlanController, updatePlanController, deletePlanController } = require('../controller/PlanController');
const { getAllTopUpController, getTopUpByIdController, createTopUpController, updateTopUpController, deleteTopUpController } = require('../controller/TopUpController');
const { getAllModeratorsController, createModeratorController, updateModeratorController, getModeratorDetailController, deleteModeratorController } = require('../controller/createModeratorController');
const { getAllStylesController, createStyleController, updateStyleController, deleteStyleController, getStyleByIdController } = require('../controller/StyleController');
const { getAdminDetailController } = require('../controller/AdminController');

const router = express.Router();

// Public routes
router.get('/models', getAllModelsController);
router.get('/models/:modelId', getModelController);
router.post('/models/:id/configure', configureModelSettingsController);
router.get('/model/select-options', getQualityLevelAspectRatioForSelect);

router.route('/create-model').post(createModelController)        
router.route('/edit/model/:id').post(updateModelController)        
router.post('/delete-model/:id', deleteModelController); 

router.route('/plans').post(getAllPlansController);
router.route("/plan/:package_id").post(getPlanByIdController);
router.route('/create-plan').post(createPlanController);
router.route('/edit/plan/:package_id').post(updatePlanController);
router.route("/delete-plan/:package_id").post(deletePlanController);

// top-up
router.route('/top-ups').post(getAllTopUpController);
router.route('/top-up/:plan_id').post(getTopUpByIdController);
router.route('/create-top-up').post(createTopUpController);
router.route('/edit/top-up/:plan_id').post(updateTopUpController);
router.route('/delete-top-up/:topup_package_id').post(deleteTopUpController);


// moderator adding
router.route('/get-all-moderators').get(getAllModeratorsController)
router.route('/get-moderator-detail/:user_id').get(getModeratorDetailController)
router.route('/create-moderator').post(createModeratorController);
router.route('/update-moderator/:user_id').post(updateModeratorController)
router.route('/delete-moderator/:user_id').post(deleteModeratorController)

// style 
router.route('/admin/styles').post(getAllStylesController);
router.route('/get-style/:style_id').post(getStyleByIdController);
// router.route('/create-style').post(createStyleController);
// router.route('/update-style/:style_id').post(updateStyleController);
router.route('/create-style').post(upload.single('styleImage'), createStyleController);
router.route('/update-style/:style_id').post(upload.single('styleImage'), updateStyleController);
router.route('/delete-style/:style_id').post(deleteStyleController);

// admin detail
router.route('/get-admin-detail').post(getAdminDetailController);

module.exports = router;