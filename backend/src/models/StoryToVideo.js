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
     user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",   // 👈 table name of User
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    narration: {
        type: DataTypes.JSON,
        allowNull: true,
    }
    ,
    video_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    video_path: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    error_message: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    language: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subtitles: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    status:{
        type: DataTypes.ENUM("pending", "in-progress","generating-audio", "generating-video","generating-subtitles", "done", "failed"),
        allowNull: false,
        defaultValue: "pending",
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