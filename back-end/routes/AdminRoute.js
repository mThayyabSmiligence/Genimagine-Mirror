const express = require('express');
const { getAllModelsController, getModelController, configureModelSettingsController, createModelController, deleteModelController, updateModelController, getQualityLevelAspectRatioForSelect } = require('../controller/IGSettingController');
const { getAllPlansController, getPlanByIdController, createPlanController, updatePlanController, deletePlanController } = require('../controller/PlanController');
const router = express.Router();

// Public routes
router.get('/models', getAllModelsController);
router.get('/models/:modelId', getModelController);
router.post('/models/:id/configure', configureModelSettingsController);
router.get('/model/select-options', getQualityLevelAspectRatioForSelect);

router.route('/create-model').post(createModelController)        
router.route('/edit/model/:id').post(updateModelController)        
router.post('/model/:id', deleteModelController); 

router.route('/plans').post(getAllPlansController);
router.route("/plan/:package_id").post(getPlanByIdController);
router.route('/create-plan').post(createPlanController);
router.route('/edit/plan/:package_id').post(updatePlanController);
router.route("/delete-plan/:package_id").post(deletePlanController);

// router.get('/aspect-ratios', getAspectRatiosController);

// router.get('/styles', SettingsController.getStyles);
// router.get('/styles/:id', SettingsController.getStyle);
// router.get('/generation-limits', SettingsController.getGenerationLimits);

// Admin protected routes
// router.post('/aspect-ratios', verifyAdmin, SettingsController.createAspectRatio);
// router.put('/aspect-ratios', verifyAdmin, SettingsController.updateAspectRatio);
// router.post('/models', verifyAdmin, SettingsController.createModel);
// router.put('/models', verifyAdmin, SettingsController.updateModel);
// router.post('/styles', verifyAdmin, SettingsController.createStyle);
// router.put('/styles', verifyAdmin, SettingsController.updateStyle);
// router.put('/generation-limits', verifyAdmin, SettingsController.updateGenerationLimit);

module.exports = router;