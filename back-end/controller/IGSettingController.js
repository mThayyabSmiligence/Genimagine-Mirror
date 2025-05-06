// const {
//     getAllAspectRatios,
//     createAspectRatio,
//     updateAspectRatio,
//     getAllQualityLevels,
//     createQualityLevel,
//     updateQualityLevel,
//     getAllModels,
//     getModelById,
//     createModel,
//     updateModel,
//     getDimensionsForQuality,
//     setDimensionsForQuality,
//     getAllStyles,
//     getStyleById,
//     createStyle,
//     updateStyle,
//     getGenerationLimits,
//     updateGenerationLimit
// } = require('../service/SettingsService');

const { getAllModels, getModelById, configureModelSettingsService } = require("../service/IGSettingService");

// Aspect Ratio Controllers
// exports.getAspectRatios = async (req, res) => {
//     try {
//         const ratios = await getAllAspectRatios();
//         res.status(200).json(ratios);
//     } catch (error) {
//         console.error('Error getting aspect ratios:', error);
//         res.status(500).json({ message: 'Error getting aspect ratios' });
//     }
// };

// exports.createAspectRatio = async (req, res) => {
//     try {
//         const { ratio } = req.body;
//         const id = await createAspectRatio(ratio);
//         res.status(201).json({ id, ratio });
//     } catch (error) {
//         console.error('Error creating aspect ratio:', error);
//         res.status(500).json({ message: 'Error creating aspect ratio' });
//     }
// };

// exports.updateAspectRatio = async (req, res) => {
//     try {
//         const { id, ratio, isActive } = req.body;
//         await updateAspectRatio(id, ratio, isActive);
//         res.status(200).json({ message: 'Aspect ratio updated successfully' });
//     } catch (error) {
//         console.error('Error updating aspect ratio:', error);
//         res.status(500).json({ message: 'Error updating aspect ratio' });
//     }
// };

// Model Controllers
exports.getAllModelsController = async (req, res) => {

    const models = await getAllModels();

    res.status(models.status).json(models);
};

exports.getModelController = async (req, res) => {
    const { id } = req.params;
    const model = await getModelById(id);
    if (!model) {
        return res.status(404).json({ message: 'Model not found' });
    }
    res.status(model.status).json(model);
};


exports.configureModelSettingsController = async(req, res) => {
    const { id } = req.params;
    const { resolution_config, aspect_ratio_config } = req.body;

    if (!Array.isArray(resolution_config) || !Array.isArray(aspect_ratio_config)) {
        return res.status(400).json({ message: 'Both resolution_config and aspect_ratio_config must be arrays' });
    }

    const result = await configureModelSettingsService(id, resolution_config, aspect_ratio_config);
    res.status(result.status).json(result)
}

// exports.createModel = async (req, res) => {
//     try {
//         const { name, qualityLevelId, modelUrl, creditPoints } = req.body;
//         const id = await createModel(name, qualityLevelId, modelUrl, creditPoints);
//         res.status(201).json({ id, name });
//     } catch (error) {
//         console.error('Error creating model:', error);
//         res.status(500).json({ message: 'Error creating model' });
//     }
// };

// exports.updateModel = async (req, res) => {
//     try {
//         const { id, name, qualityLevelId, modelUrl, isActive, creditPoints } = req.body;
//         await updateModel(id, name, qualityLevelId, modelUrl, isActive, creditPoints);
//         res.status(200).json({ message: 'Model updated successfully' });
//     } catch (error) {
//         console.error('Error updating model:', error);
//         res.status(500).json({ message: 'Error updating model' });
//     }
// };

// // Style Controllers
// exports.getStyles = async (req, res) => {
//     try {
//         const styles = await getAllStyles();
//         res.status(200).json(styles);
//     } catch (error) {
//         console.error('Error getting styles:', error);
//         res.status(500).json({ message: 'Error getting styles' });
//     }
// };

// exports.getStyle = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const style = await getStyleById(id);
//         if (!style) {
//             return res.status(404).json({ message: 'Style not found' });
//         }
//         res.status(200).json(style);
//     } catch (error) {
//         console.error('Error getting style:', error);
//         res.status(500).json({ message: 'Error getting style' });
//     }
// };

// exports.createStyle = async (req, res) => {
//     try {
//         const { name, imagePath } = req.body;
//         const id = await createStyle(name, imagePath);
//         res.status(201).json({ id, name });
//     } catch (error) {
//         console.error('Error creating style:', error);
//         res.status(500).json({ message: 'Error creating style' });
//     }
// };

// exports.updateStyle = async (req, res) => {
//     try {
//         const { id, name, imagePath, isActive } = req.body;
//         await updateStyle(id, name, imagePath, isActive);
//         res.status(200).json({ message: 'Style updated successfully' });
//     } catch (error) {
//         console.error('Error updating style:', error);
//         res.status(500).json({ message: 'Error updating style' });
//     }
// };

// // Generation Limit Controllers
// exports.getGenerationLimits = async (req, res) => {
//     try {
//         const limits = await getGenerationLimits();
//         res.status(200).json(limits);
//     } catch (error) {
//         console.error('Error getting generation limits:', error);
//         res.status(500).json({ message: 'Error getting generation limits' });
//     }
// };

// exports.updateGenerationLimit = async (req, res) => {
//     try {
//         const { userType, dailyLimit } = req.body;
//         await updateGenerationLimit(userType, dailyLimit);
//         res.status(200).json({ message: 'Generation limit updated successfully' });
//     } catch (error) {
//         console.error('Error updating generation limit:', error);
//         res.status(500).json({ message: 'Error updating generation limit' });
//     }
// };