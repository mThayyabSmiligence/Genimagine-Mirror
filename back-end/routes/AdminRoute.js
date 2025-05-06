const express = require('express');
const { getAllModelsController, getModelController, configureModelSettingsController } = require('../controller/IGSettingController');
const router = express.Router();

// Public routes
router.get('/models', getAllModelsController);
router.get('/models/:id', getModelController);
router.post('/models/:id/configure', configureModelSettingsController);
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