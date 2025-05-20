module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    user_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    height_cm: DataTypes.SMALLINT.UNSIGNED,
    weight_kg: DataTypes.DECIMAL(5, 2),
    medical_history: DataTypes.TEXT,
    emergency_contact: DataTypes.STRING(255)
  }, {
    tableName: 'patients',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  Patient.associate = models => {
    Patient.belongsTo(models.User, { foreignKey: 'user_id', as: 'account' });
  };
  return Patient;
};