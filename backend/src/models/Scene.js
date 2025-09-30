const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

//structure outline
//id: integer
//story_id: integer
//user_id: integer
//prompt: string
//location: string
//environment: string
//characters: array of objects
//full_structured_prompt: string
//image_url: string
//image_path: string
//image_type: string
//scene_order: integer
//deleted_at: date

const Scene = sequelize.define(
  "Scene",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Every scene belongs to a story
    story_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "story", // 👈 must match your Story model
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    //user id
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

    // Scene prompt given by user
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // AI extracted / structured info
    location: {
      type: DataTypes.STRING(255),
      allowNull: true, // e.g. "rooftop", "forest", "castle hall"
    },
    environment: {
      type: DataTypes.TEXT,
      allowNull: true, // e.g. "blurred, night sky, people falling"
    },

    // Scene characters
    characters: {
      type: DataTypes.JSON, // stores array of characters {id, name, action, etc.}
      allowNull: true,
    },

    full_structured_prompt: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    full_prompt:{
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Image generation outputs
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    image_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    image_type: {
      type: DataTypes.ENUM("uploaded", "generated"),
      allowNull: false,
      defaultValue: "generated",
    },

    // Scene ordering inside a story
    scene_order: {
      type: DataTypes.INTEGER,
      allowNull: true, // e.g. Scene 1, Scene 2...
    },

    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "scenes",
    timestamps: true, // adds createdAt + updatedAt
  }
);

module.exports = Scene;
