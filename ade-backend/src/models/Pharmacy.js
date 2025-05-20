module.exports = (sequelize, DataTypes) => {
  const Pharmacy = sequelize.define('Pharmacy', {
    user_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    address: { type: DataTypes.STRING(255), allowNull: false },
    latitude: DataTypes.DECIMAL(10, 8),
    longitude: DataTypes.DECIMAL(11, 8),
    location_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_on_call: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: 'pharmacies',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Pharmacy.associate = models => {
    Pharmacy.belongsTo(models.User, { foreignKey: 'user_id', as: 'account' });
  };

  return Pharmacy;
};