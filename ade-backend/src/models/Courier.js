module.exports = (sequelize, DataTypes) => {
  const Courier = sequelize.define('Courier', {
    user_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    vehicle_type: {
      type: DataTypes.ENUM('motorbike','car','bicycle','other'),
      allowNull: false
    },
    plate_number: { type: DataTypes.STRING(20), allowNull: false },
    driver_license: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: 'couriers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Courier.associate = models => {
    Courier.belongsTo(models.User, { foreignKey: 'user_id', as: 'account' });
  };
  return Courier;
};