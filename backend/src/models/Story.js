const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

//structure outline
//id: integer
//name: string
//description: string
//user_id: integer
//thumbnail: string
//style_id: integer\

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
    
    status: {
      type: DataTypes.ENUM("started", "in-progress","generating-characters", "generating-scenes", "completed", "failed","partially-completed"),
      allowNull: false,
      defaultValue: "started",
    },
    total_scenes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    generated_scenes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    type:{
      type: DataTypes.ENUM("manual", "auto"),
      allowNull: false,
      defaultValue: "manual",
    },
    error_message: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    job_id:{
        type: DataTypes.STRING,
        allowNull: true
    },
    parsed_prompt:{
      type:DataTypes.JSON,
      allowNull:true
    }
  },
  {
    tableName: "story",  // 👈 exact table name
    timestamps: true,   // since you already have `timestamp`
  }
);

module.exports = Story;
