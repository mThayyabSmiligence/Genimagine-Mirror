const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const AiLearningSpecModule = sequelize.define(
  "AiLearningSpecModule",
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    spec_id: { 
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
    is_reused: { type: DataTypes.BOOLEAN, defaultValue: false },
    reused_from_module_id: { 
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model:{
                tableName: "modules",
                schema: "ai_learning",
            }, // 👈 must match your Story model
            key: "id",
        }
    },
    reused_from_spec_id: { 
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model:{
                tableName: "specs",
                schema: "ai_learning",
            }, // 👈 must match your Story model
            key: "id",
        },
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "OVERRIDDEN", "DEPRECATED"),
      defaultValue: "ACTIVE",
    },
   
  },
  {
    tableName: "spec_modules",
    schema: "ai_learning",
    timestamps: true,
    indexes: [{ unique: true, fields: ["spec_id", "module_id"] }],
  }
);

module.exports = AiLearningSpecModule;
