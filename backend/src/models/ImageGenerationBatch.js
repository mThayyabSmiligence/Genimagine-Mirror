const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ImageGenerationBatch = sequelize.define("ImageGenerationBatch", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  character_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "characters", // 👈 your Character model name
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  status: {
    type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",// 👈 table name of User
      key: "user_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
}, {
  tableName: "image_generation_batches",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = ImageGenerationBatch;
