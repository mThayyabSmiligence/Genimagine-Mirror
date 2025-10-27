const {DataTypes} = require("sequelize");
const sequelize = require("../config/database");

//table structure
//id: integer
//story_id: integer
//user_id: integer
//narration: json
//video_url: string
//video_path: string
//error_message: string
//language: string
//subtitles: json
//status: string
//created_at: date
//updated_at: date
// primary_language: STRING,
// scene_timings: JSON, // [{scene_order: 1, duration: 5.2, scene_id: 123}, ...]
// audio_tracks: JSON, // [{language: 'en', url: '...', type: 'primary'}, ...]
// subtitle_languages: JSON // ['en', 'es', 'hi']
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
    primary_language: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    scene_timings: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    audio_tracks: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    subtitle_languages: {
        type: DataTypes.JSON,
        allowNull: true,
    }
});

module.exports = StoryToVideo