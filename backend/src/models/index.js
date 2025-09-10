const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Story = require("./Story");
db.Character = require("./Character");
db.Style = require("./Style");

// Define associations with alias
db.Story.hasMany(db.Character, { foreignKey: "story_id", as: "characters" });
db.Character.belongsTo(db.Story, { foreignKey: "story_id", as: "story" });

db.Style.hasMany(db.Story, { foreignKey: "style_id", as: "stories" });
db.Story.belongsTo(db.Style, { foreignKey: "style_id", as: "style" });

module.exports = db;
