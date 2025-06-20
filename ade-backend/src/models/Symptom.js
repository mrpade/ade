'use strict';
module.exports = (sequelize, DataTypes) => {
  const Symptom = sequelize.define('Symptom', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true }
  }, {
    tableName: 'symptoms',
    timestamps: false,
    indexes: [{ type: 'FULLTEXT', fields: ['name'] }]
  });

  Symptom.associate = models => {
    Symptom.belongsToMany(models.DiseasesList, {
      through: models.DiseaseSymptom,
      foreignKey: 'symptom_id',
      otherKey: 'disease_id'
    });
  };

  return Symptom;
};
