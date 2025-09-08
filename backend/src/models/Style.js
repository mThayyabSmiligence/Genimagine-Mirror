const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// models/Style.js
module.exports = (sequelize, DataTypes) => {
  const Style = sequelize.define("Style", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    image_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "styles",   // matches your table name
    timestamps: true,      // enables createdAt & updatedAt
    createdAt: "created_at", // maps to your column
    updatedAt: "updated_at", // maps to your column
  });

  return Style;
};
