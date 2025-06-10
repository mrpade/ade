// src/models/DiseasesList.js
/*const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const DiseasesList = sequelize.define('DiseasesList', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true },
  Nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
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

module.exports = DiseasesList;*/

'use strict';

module.exports = (sequelize, DataTypes) => {
  const DiseasesList = sequelize.define('DiseasesList', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    Nom: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: 'Diseases_list',   // nom exact de ta table MySQL
    timestamps: false
  });

  // Associations éventuelles
  DiseasesList.associate = (models) => {
    // ex. DiseasesList.belongsTo(models.User);
  };

  return DiseasesList;
};
