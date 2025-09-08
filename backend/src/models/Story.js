const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Story = sequelize.define(
  "Story",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    thumbnail: {
      type: DataTypes.STRING(500), // store URL/path
      allowNull: true,
    },
    style_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "styles",   // 👈 table name of User
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "story",  // 👈 exact table name
    timestamps: true,   // since you already have `timestamp`
  }
);

module.exports = Story;
