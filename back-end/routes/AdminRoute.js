const express = require('express');
const { getAllModelsController, getModelController, configureModelSettingsController, createModelController, deleteModelController, updateModelController, getQualityLevelAspectRatioForSelect } = require('../controller/IGSettingController');
const { getAllPlansController, getPlanByIdController, createPlanController, updatePlanController, deletePlanController } = require('../controller/PlanController');
const { getAllTopUpController, getTopUpByIdController, createTopUpController, updateTopUpController, deleteTopUpController } = require('../controller/TopUpController');
const { getAllModeratorsController, createModeratorController, updateModeratorController, getModeratorDetailController } = require('../controller/createModeratorController');

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

module.exports = router;