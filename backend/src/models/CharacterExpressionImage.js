const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CharacterExpressionImage = sequelize.define("CharacterExpressionImage", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "image_generation_batches", // 👈 your batch model name
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  character_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "characters", // 👈 your character model name
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  story_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "story", // 👈 your story model name
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  expression_type: {
    type: DataTypes.ENUM("emotion", "pose"),
    allowNull: false,
  },
  expression: {
    type: DataTypes.STRING(100), // e.g., happy, angry, running, jumping
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true, // becomes available once generated
  },
  status: {
    type: DataTypes.ENUM("queued", "processing", "done", "failed"),
    allowNull: false,
    defaultValue: "queued",
  },
  error_message: {
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
}, {
  tableName: "character_expression_images",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = CharacterExpressionImage;
