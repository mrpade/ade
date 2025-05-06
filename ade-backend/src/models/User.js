// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('./index');  // ton fichier de connexion

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true
});

module.exports = User;