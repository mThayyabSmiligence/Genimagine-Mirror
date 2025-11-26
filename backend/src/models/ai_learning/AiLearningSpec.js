const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");


//table structure
//id: integer
//user_id: integer
//title: string
//original_name: string
//storage_url: string
//mime_type: string
//language: string
//status: string
//error_message: text
const AiLearningSpec = sequelize.define(
    "AiLearningSpec",
    {
        id: { 
            type: DataTypes.BIGINT.UNSIGNED, 
            autoIncrement: true, 
            primaryKey: true 
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
        title: { 
            type: DataTypes.STRING(255), 
            allowNull: false 
        },
        original_name: { 
            type: DataTypes.STRING(255), 
            allowNull: false 
        },
        storage_url: { 
            type: DataTypes.STRING(512), 
            allowNull: false 
        },
        mime_type: { 
            type: DataTypes.STRING(100), 
            allowNull: false 
        },
        language: { 
            type: DataTypes.STRING(20), 
            defaultValue: "en" 
        },
        status: {
            type: DataTypes.ENUM("UPLOADED", "PROCESSING", "READY", "FAILED"),
            defaultValue: "UPLOADED",
            allowNull: false,
        },
        error_message: { 
            type: DataTypes.TEXT 
        },
        learning_type:{
            type:DataTypes.ENUM("tech", "non_tech"),
            defaultValue:"tech",
            allowNull:false
        },
        generation_type: {
            type: DataTypes.ENUM("full_learning","single_module"),
            defaultValue: "full_learning",
            allowNull: false,
        },
    },
    {
        tableName: "specs",
        schema: "ai_learning",
        timestamps: true,
    }
);

module.exports = AiLearningSpec;
