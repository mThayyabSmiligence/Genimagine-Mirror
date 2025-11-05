const Sequelize = require("sequelize");
const sequelize = require("../config/database");



const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Story = require("./Story");
db.Character = require("./Character");
db.Style = require("./Style");
db.ImageGenerationBatch = require("./ImageGenerationBatch");
db.CharacterExpressionImage = require("./CharacterExpressionImage");
db.Scene = require("./Scene");
db.StoryToVideo = require("./StoryToVideo");
db.ExploreVideo = require("./ExploreVideo")
db.Users = require("./Users")

// Define associations with alias
db.Story.hasMany(db.Character, { foreignKey: "story_id", as: "characters" });
db.Character.belongsTo(db.Story, { foreignKey: "story_id", as: "story" });

//story and style associations
db.Style.hasMany(db.Story, { foreignKey: "style_id", as: "stories" });
db.Story.belongsTo(db.Style, { foreignKey: "style_id", as: "style" });

// 🔗 New associations

//image generation batch and character associations
db.Character.hasMany(db.ImageGenerationBatch, { foreignKey: "character_id", as: "batches" });
db.ImageGenerationBatch.belongsTo(db.Character, { foreignKey: "character_id", as: "character" });

//character expression image and image generation batch associations
db.ImageGenerationBatch.hasMany(db.CharacterExpressionImage, { foreignKey: "batch_id", as: "expression_images" });
db.CharacterExpressionImage.belongsTo(db.ImageGenerationBatch, { foreignKey: "batch_id", as: "batch" });

//character expression image and character associations
db.Character.hasMany(db.CharacterExpressionImage, { foreignKey: "character_id", as: "expression_images" });
db.CharacterExpressionImage.belongsTo(db.Character, { foreignKey: "character_id", as: "character" });

//scene and story associations
db.Story.hasMany(db.Scene, { foreignKey: "story_id", as: "scenes" });
db.Scene.belongsTo(db.Story, { foreignKey: "story_id", as: "story" });

//story and video associations
db.Story.hasMany(db.StoryToVideo, { foreignKey: "story_id", as: "video" });
db.StoryToVideo.belongsTo(db.Story, { foreignKey: "story_id", as: "story" });

// ExploreVideo belongs to Story (to get thumbnail) 
db.ExploreVideo.belongsTo(db.Story, { foreignKey: "story_id", targetKey: "id", as: "story" });

// ExploreVideo belongs to StoryToVideo (to get video data)
db.ExploreVideo.belongsTo(db.StoryToVideo, { foreignKey: "story_id", targetKey: "story_id", as: "videoData" });

module.exports = db;
