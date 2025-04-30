const db = require('../config/connectDatabase')

const db = require('../config/connectDatabase');

// Aspect Ratio Functions
async function getAllAspectRatios() {
    const [rows] = await db.execute('SELECT * FROM aspect_ratios WHERE is_active = TRUE');
    return rows;
}

async function createAspectRatio(ratio) {
    const [result] = await db.execute(
        'INSERT INTO aspect_ratios (ratio) VALUES (?)',
        [ratio]
    );
    return result.insertId;
}

async function updateAspectRatio(id, ratio, isActive) {
    await db.execute(
        'UPDATE aspect_ratios SET ratio = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
        [ratio, isActive, id]
    );
}

// Quality Level Functions
async function getAllQualityLevels() {
    const [rows] = await db.execute('SELECT * FROM quality_levels WHERE is_active = TRUE');
    return rows;
}

async function createQualityLevel(name, resolution) {
    const [result] = await db.execute(
        'INSERT INTO quality_levels (name, resolution) VALUES (?, ?)',
        [name, resolution]
    );
    return result.insertId;
}

async function updateQualityLevel(id, name, resolution, isActive) {
    await db.execute(
        'UPDATE quality_levels SET name = ?, resolution = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
        [name, resolution, isActive, id]
    );
}

// Model Functions
async function getAllModels() {
    const [rows] = await db.execute(`
        SELECT m.*, ql.name AS quality_name, ql.resolution, mcp.credit_points 
        FROM models m
        JOIN quality_levels ql ON m.quality_level_id = ql.id
        LEFT JOIN model_credit_points mcp ON m.id = mcp.model_id
        WHERE m.is_active = TRUE
    `);
    return rows;
}

async function getModelById(modelId) {
    const [rows] = await db.execute(`
        SELECT m.*, ql.name AS quality_name, ql.resolution, mcp.credit_points 
        FROM models m
        JOIN quality_levels ql ON m.quality_level_id = ql.id
        LEFT JOIN model_credit_points mcp ON m.id = mcp.model_id
        WHERE m.id = ?
    `, [modelId]);
    return rows[0];
}

async function createModel(name, qualityLevelId, modelUrl, creditPoints) {
    const [modelResult] = await db.execute(
        'INSERT INTO models (name, quality_level_id, cloudflare_model_url) VALUES (?, ?, ?)',
        [name, qualityLevelId, modelUrl]
    );
    
    if (creditPoints > 0) {
        await db.execute(
            'INSERT INTO model_credit_points (model_id, credit_points) VALUES (?, ?)',
            [modelResult.insertId, creditPoints]
        );
    }
    
    return modelResult.insertId;
}

async function updateModel(id, name, qualityLevelId, modelUrl, isActive, creditPoints) {
    await db.execute(
        'UPDATE models SET name = ?, quality_level_id = ?, cloudflare_model_url = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
        [name, qualityLevelId, modelUrl, isActive, id]
    );
    
    // Update or insert credit points
    const [existing] = await db.execute(
        'SELECT id FROM model_credit_points WHERE model_id = ?',
        [id]
    );
    
    if (existing.length > 0) {
        await db.execute(
            'UPDATE model_credit_points SET credit_points = ? WHERE model_id = ?',
            [creditPoints, id]
        );
    } else if (creditPoints > 0) {
        await db.execute(
            'INSERT INTO model_credit_points (model_id, credit_points) VALUES (?, ?)',
            [id, creditPoints]
        );
    }
}

// Aspect Ratio Dimensions Functions
async function getDimensionsForQuality(qualityLevelId) {
    const [rows] = await db.execute(`
        SELECT ard.*, ar.ratio 
        FROM aspect_ratio_dimensions ard
        JOIN aspect_ratios ar ON ard.aspect_ratio_id = ar.id
        WHERE ard.quality_level_id = ?
    `, [qualityLevelId]);
    return rows;
}

async function setDimensionsForQuality(aspectRatioId, qualityLevelId, width, height) {
    const [existing] = await db.execute(
        'SELECT id FROM aspect_ratio_dimensions WHERE aspect_ratio_id = ? AND quality_level_id = ?',
        [aspectRatioId, qualityLevelId]
    );
    
    if (existing.length > 0) {
        await db.execute(
            'UPDATE aspect_ratio_dimensions SET width = ?, height = ?, updated_at = NOW() WHERE id = ?',
            [width, height, existing[0].id]
        );
    } else {
        await db.execute(
            'INSERT INTO aspect_ratio_dimensions (aspect_ratio_id, quality_level_id, width, height) VALUES (?, ?, ?, ?)',
            [aspectRatioId, qualityLevelId, width, height]
        );
    }
}

// Style Functions
async function getAllStyles() {
    const [rows] = await db.execute('SELECT * FROM styles WHERE is_active = TRUE');
    return rows;
}

async function getStyleById(styleId) {
    const [rows] = await db.execute('SELECT * FROM styles WHERE id = ?', [styleId]);
    return rows[0];
}

async function createStyle(name, imagePath) {
    const [result] = await db.execute(
        'INSERT INTO styles (name, image_path) VALUES (?, ?)',
        [name, imagePath]
    );
    return result.insertId;
}

async function updateStyle(id, name, imagePath, isActive) {
    await db.execute(
        'UPDATE styles SET name = ?, image_path = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
        [name, imagePath, isActive, id]
    );
}

// Generation Limit Functions
async function getGenerationLimits() {
    const [rows] = await db.execute('SELECT * FROM generation_limits');
    return rows;
}

async function updateGenerationLimit(userType, dailyLimit) {
    const [existing] = await db.execute(
        'SELECT id FROM generation_limits WHERE user_type = ?',
        [userType]
    );
    
    if (existing.length > 0) {
        await db.execute(
            'UPDATE generation_limits SET daily_limit = ?, updated_at = NOW() WHERE id = ?',
            [dailyLimit, existing[0].id]
        );
    } else {
        await db.execute(
            'INSERT INTO generation_limits (user_type, daily_limit) VALUES (?, ?)',
            [userType, dailyLimit]
        );
    }
}

module.exports = {
    getAllAspectRatios,
    createAspectRatio,
    updateAspectRatio,
    getAllQualityLevels,
    createQualityLevel,
    updateQualityLevel,
    getAllModels,
    getModelById,
    createModel,
    updateModel,
    getDimensionsForQuality,
    setDimensionsForQuality,
    getAllStyles,
    getStyleById,
    createStyle,
    updateStyle,
    getGenerationLimits,
    updateGenerationLimit
};