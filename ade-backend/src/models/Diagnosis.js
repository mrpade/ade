module.exports = (sequelize, DataTypes) => {
  const Diagnosis = sequelize.define('Diagnosis', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    patient_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    disease_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    symptoms_json: DataTypes.JSON,
    status: { type: DataTypes.ENUM('pending','validated','rejected'), defaultValue: 'pending' }
  }, {
    tableName: 'diagnoses',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Diagnosis.associate = models => {
    Diagnosis.belongsTo(models.User, { foreignKey: 'patient_id', as: 'patient' });
    Diagnosis.belongsTo(models.DiseasesList, { foreignKey: 'disease_id', as: 'disease' });
  };
  return Diagnosis;
};