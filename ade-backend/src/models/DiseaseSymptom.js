'use strict';
module.exports = (sequelize, DataTypes) => {
  const DiseaseSymptom = sequelize.define('DiseaseSymptom', {
    disease_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    symptom_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true }
  }, {
    tableName: 'disease_symptoms',
    timestamps: false
  });

  return DiseaseSymptom;
};