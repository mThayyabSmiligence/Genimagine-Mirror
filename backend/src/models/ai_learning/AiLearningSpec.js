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
//learning_type: string
//created_at: date
//updated_at: date
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
            type: DataTypes.STRING(255)
        },
        storage_url: { 
            type: DataTypes.STRING(512), 
        },
        storage_path: { 
            type: DataTypes.STRING(512), 
        },
        mime_type: { 
            type: DataTypes.STRING(100)
        },
        language: { 
            type: DataTypes.STRING(20), 
            defaultValue: "en" 
        },
        status: {
            type: DataTypes.ENUM("Pending", "Processing","Creating-Modules","Generating-Module-Content" ,"Completed", "Failed"),
            defaultValue: "Pending",
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
