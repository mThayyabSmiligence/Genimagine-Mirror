const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const AiLearningSlide = sequelize.define(
  "AiLearningSlide",
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    module_id: { 
        type: DataTypes.BIGINT.UNSIGNED, 
        allowNull: false ,
        references: {
            model:{
                tableName: "modules",
                schema: "ai_learning",
            }, // 👈 must match your Story model
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    slide_no: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

    title: { type: DataTypes.STRING(255), allowNull: false },
    bullets_json: { type: DataTypes.JSON },
    speaker_notes: { type: DataTypes.TEXT },
    visual_hint: { type: DataTypes.STRING(255) },
    image_url: { type: DataTypes.STRING(512) },
    audio_url: { type: DataTypes.STRING(512) },
    duration_sec: { type: DataTypes.INTEGER.UNSIGNED },

  },
  {
    tableName: "slides",
    schema: "ai_learning",
    timestamps: true,
    indexes: [{ unique: true, fields: ["module_id", "slide_no"] }],
  }
);

module.exports = AiLearningSlide;
