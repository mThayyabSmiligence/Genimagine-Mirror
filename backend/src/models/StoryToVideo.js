const {DataTypes} = require("sequelize");
const sequelize = require("../config/database");

const StoryToVideo = sequelize.define("StoryToVideo", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    story_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "story", // 👈 must match your Story table/model
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    narration: {
        type: DataTypes.JSON,
        allowNull: false,
    }
    ,
    video_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    video_path: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = StoryToVideo