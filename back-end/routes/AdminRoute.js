const express = require('express');
const router = express.Router();
// const SettingsController = require('../controller/SettingsController');
// const { verifyAdmin } = require('../middleware/authMiddleware');

// Public routes
// router.get('/aspect-ratios', SettingsController.getAspectRatios);
// router.get('/models', SettingsController.getModels);
// router.get('/models/:id', SettingsController.getModel);
// router.get('/styles', SettingsController.getStyles);
// router.get('/styles/:id', SettingsController.getStyle);
// router.get('/generation-limits', SettingsController.getGenerationLimits);

// // Admin protected routes
// router.post('/aspect-ratios', verifyAdmin, SettingsController.createAspectRatio);
// router.put('/aspect-ratios', verifyAdmin, SettingsController.updateAspectRatio);
// router.post('/models', verifyAdmin, SettingsController.createModel);
// router.put('/models', verifyAdmin, SettingsController.updateModel);
// router.post('/styles', verifyAdmin, SettingsController.createStyle);
// router.put('/styles', verifyAdmin, SettingsController.updateStyle);
// router.put('/generation-limits', verifyAdmin, SettingsController.updateGenerationLimit);

module.exports = router;