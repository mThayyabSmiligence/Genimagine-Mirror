const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const AiLearningModule = sequelize.define(
  "AiLearningModule",
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    canonical_key: { type: DataTypes.STRING(255) },
    tech_tag: { type: DataTypes.STRING(100) },
    difficulty: {
      type: DataTypes.ENUM("BEGINNER", "INTERMEDIATE", "ADVANCED"),
      defaultValue: "BEGINNER",
    },
    est_minutes: { type: DataTypes.INTEGER.UNSIGNED },
    origin_spec_id: { 
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model:{
                tableName: "specs",
                schema: "ai_learning",
            }, // 👈 must match your Story model
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", 
    },
    origin_job_id: { 
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model:{
                tableName: "jobs",
                schema: "ai_learning",
            }, // 👈 must match your Story model
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
  },
  {
    tableName: "modules",
    schema: "ai_learning",
    timestamps: false,
  }
);

module.exports = AiLearningModule;
