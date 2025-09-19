const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


//structure outline
//id: integer
//name: string
//description: string
//full_description: string
//story_id: integer
//image_url: string
//image_path: string
//image_type: string
//user_id: integer
//deleted_at: date

const Character = sequelize.define("Character", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    full_description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true, 
    },
    image_path: {
      type: DataTypes.STRING(255),
      allowNull: true, 
    },
    image_type: {
      type: DataTypes.ENUM("uploaded", "generated"),
      allowNull: false,
      defaultValue: "generated",
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
}, {
    tableName: "characters",
    timestamps: true, // ✅ Sequelize will add createdAt and updatedAt automatically
});

module.exports = Character;