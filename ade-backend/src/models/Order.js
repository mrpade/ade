module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    patient_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    pharmacy_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: { type: DataTypes.ENUM('pending','paid','preparing','shipped','delivered'), allowNull: false, defaultValue: 'pending' },
    total_amount: { type: DataTypes.DECIMAL(10,2), allowNull: false }
  }, {
    tableName: 'orders',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Order.associate = models => {
    Order.belongsTo(models.Patient, { foreignKey: 'patient_id' });
    Order.belongsTo(models.Pharmacy, { foreignKey: 'pharmacy_id' });
  };

  return Order;
};