
// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize      = require('./index');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,      // ← plus simple
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
    // unsigned: true             // ← si tu tiens vraiment à l'unsigned, mais pas nécessaire
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
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true
});

module.exports = User;
