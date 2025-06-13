module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    consultation_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    pdf_url: { type: DataTypes.STRING(255), allowNull: false }
  }, {
    tableName: 'prescriptions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Prescription.associate = models => {
    Prescription.belongsTo(models.Consultation, { foreignKey: 'consultation_id' });
  };

  return Prescription;
};