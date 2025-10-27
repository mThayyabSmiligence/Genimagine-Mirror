const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ExploreVideo = sequelize.define(
  "ExploreVideo",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
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
    story_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "story",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    }
  },
  {
    tableName: "explorevideos",
    timestamps: true,
  }
);

module.exports = ExploreVideo;
