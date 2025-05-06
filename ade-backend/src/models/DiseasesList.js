// src/models/DiseasesList.js
const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const DiseasesList = sequelize.define('DiseasesList', {
  Nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
    primaryKey: true
  },
  Symptomes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Causes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Transmission: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Traitements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Gravite_sur_5: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Contagieuse: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Zone_geographique: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Diseases_list',   // <-- nom exact de ta table MySQL
  timestamps: false
});

module.exports = DiseasesList;
