module.exports = (sequelize, DataTypes) => {
  const Consultation = sequelize.define('Consultation', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    patient_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    doctor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    diagnosis_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    scheduled_at: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM('planned','done','cancelled'),
      allowNull: false,
      defaultValue: 'planned'
    },
    mode: { type: DataTypes.ENUM('video','audio'), allowNull: false }
  }, {
    tableName: 'consultations',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Consultation.associate = models => {
    Consultation.belongsTo(models.Patient, { foreignKey: 'patient_id' });
    Consultation.belongsTo(models.Doctor, { foreignKey: 'doctor_id' });
    Consultation.belongsTo(models.Diagnosis, { foreignKey: 'diagnosis_id' });
  };

  return Consultation;
};
