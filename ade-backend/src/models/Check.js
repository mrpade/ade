module.exports = (sequelize, DataTypes) => {
  const Check = sequelize.define('Check', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    diagnosis_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    doctor_user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    answer: DataTypes.TEXT
  }, {
    tableName: 'checks',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Check.associate = models => {
    Check.belongsTo(models.Diagnosis, { foreignKey: 'diagnosis_id' });
    Check.belongsTo(models.Doctor, {
      foreignKey: 'doctor_user_id',
      targetKey: 'user_id'
    });
  };

  return Check;
};
