const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
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
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    free_generation_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_free_generated: {
      type: DataTypes.DATE,
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
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    previous_warning_data: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: false, // since we’re using custom created_at & updated_at
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['role'] },
      { fields: ['status'] }
    ]
  });

  return User;
};
