const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const AiLearningObjective = sequelize.define(
    "AiLearningObjective",
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
        title: { type: DataTypes.STRING(255), allowNull: false },
        description: { type: DataTypes.TEXT },
        difficulty: {
            type: DataTypes.ENUM("BEGINNER", "INTERMEDIATE", "ADVANCED"),
            defaultValue: "BEGINNER",
        },
        prerequisites: { type: DataTypes.TEXT },
        est_minutes: { type: DataTypes.INTEGER.UNSIGNED },
        order_index: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    },
    {
        tableName: "learning_objectives",
        schema: "ai_learning",
        timestamps: true,
    }
);

module.exports = AiLearningObjective;
