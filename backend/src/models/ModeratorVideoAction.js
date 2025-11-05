// Models/ModeratorVideoAction.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ModeratorVideoAction = sequelize.define(
  "ModeratorVideoAction",
  {
    action_id: {
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
    report_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "video_reports",
        key: "report_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    action: {
      type: DataTypes.ENUM("delete"),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    action_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "moderator_video_actions",
    timestamps: false,
  }
);

module.exports = ModeratorVideoAction;
