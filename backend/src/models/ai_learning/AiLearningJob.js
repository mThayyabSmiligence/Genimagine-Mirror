const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const AiLearningJob = sequelize.define(
    "AiLearningJob",
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
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        job_type: {
            type: DataTypes.ENUM("full_learning","single_module"),
            defaultValue: "full_learning",
            allowNull: false,
        },
        status: {
        type: DataTypes.ENUM("QUEUED", "RUNNING", "COMPLETED", "FAILED"),
        defaultValue: "QUEUED",
        },
        progress_pct: { type: DataTypes.TINYINT.UNSIGNED, defaultValue: 0 },
        error_message: { type: DataTypes.TEXT, defaultValue: null },
        started_at: { type: DataTypes.DATE },
        finished_at: { type: DataTypes.DATE },
    },
    {
        tableName: "jobs",
        schema: "ai_learning",
        timestamps: true,
    }
);

module.exports = AiLearningJob;
