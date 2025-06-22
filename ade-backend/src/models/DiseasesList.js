
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypesParam = DataTypes) => {
  const DiseasesList = sequelize.define('DiseasesList', {
    id: {
      type: DataTypesParam.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    Nom: {
      type: DataTypesParam.STRING(255),
      allowNull: false,
    },
    Symptomes: {
      type: DataTypesParam.TEXT,
      allowNull: true
    },
    Causes: {
      type: DataTypesParam.TEXT,
      allowNull: true
    },
    Transmission: {
      type: DataTypesParam.TEXT,
      allowNull: true
    },
    Traitements: {
      type: DataTypesParam.TEXT,
      allowNull: true
    },
    Gravite_sur_5: {
      type: DataTypesParam.STRING(50),
      allowNull: true
    },
    Contagieuse: {
      type: DataTypesParam.STRING(50),
      allowNull: true
    },
    Zone_geographique: {
      type: DataTypesParam.TEXT,
      allowNull: true
    },
    Notes: {
      type: DataTypesParam.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Diseases_list',   // nom exact de ta table MySQL
    timestamps: false
  });

  // Associations éventuelles
   DiseasesList.associate = (models) => {
    DiseasesList.belongsToMany(models.Symptom, {
      through: models.DiseaseSymptom,
      foreignKey: 'disease_id',
      otherKey: 'symptom_id'
    });
  };

  return DiseasesList;
};
