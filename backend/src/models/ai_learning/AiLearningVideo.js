const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const AiLearningVideo = sequelize.define(
  "AiLearningVideo",
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    module_id: { 
        type: DataTypes.BIGINT.UNSIGNED, 
        allowNull: false,
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

    video_url: { type: DataTypes.STRING(512), allowNull: false },
    srt_url: { type: DataTypes.STRING(512) },
    thumbnail_url: { type: DataTypes.STRING(512) },
    duration_sec: { type: DataTypes.INTEGER.UNSIGNED },

    status: {
      type: DataTypes.ENUM("GENERATING", "READY", "FAILED"),
      defaultValue: "GENERATING",
    },
    error_message: { type: DataTypes.TEXT },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "videos",
    schema: "ai_learning",
    timestamps: true,
    indexes: [{ unique: true, fields: ["module_id"] }],
  }
);

module.exports = AiLearningVideo;