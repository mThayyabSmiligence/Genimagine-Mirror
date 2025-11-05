const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


//structure outline
//user_id: integer
//username: string
//age: integer
//email: string
//password_hash: string
//role: string
//credits: integer
//created_at: date
//updated_at: date
//free_generation_count: integer
//last_free_generated: date
//register_type: string
//is_verified: boolean
//DOB: date
//status: string
//warning_data: json
//is_deleted: boolean
//deleted_at: date
//previous_warning_data: json
const Users = sequelize.define('users', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'moderator'),
    defaultValue: 'user'
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  free_generation_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_free_generated: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  register_type: {
    type: DataTypes.ENUM('password', 'google-sign-in'),
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  DOB: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'banned', 'suspended', 'deleted'),
    defaultValue: 'active'
  },
  warning_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  previous_warning_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'users',
  timestamps: false, // Disable automatic createdAt/updatedAt since you're using custom fields
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci'
});

module.exports = Users;
