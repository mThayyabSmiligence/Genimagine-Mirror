// // models/VideoReport.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VideoReport = sequelize.define(
  "VideoReport",
  {
    report_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "storytovideos",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    published_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "explorevideos",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
     report_details: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of [{reason, user_id, username, reported_at}, ...]'
    },
    report_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Number of times this video has been reported'
    },
    action_type: {
      type: DataTypes.ENUM("none", "ban", "suspend", "warn", "no_action", "delete"),
      defaultValue: "none",
    },
    action_taken_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    action_taken_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reported_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "video_reports",
    timestamps: false,
    indexes: [
      { fields: ["action_type"] },
      { fields: ["reported_at"] },
      { fields: ["video_id"] },
      { fields: ["published_id"] },
    ],
  }
);

module.exports = VideoReport;
