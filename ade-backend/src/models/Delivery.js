module.exports = (sequelize, DataTypes) => {
  const Delivery = sequelize.define('Delivery', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
    courier_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: { type: DataTypes.ENUM('assigned','picked','delivered'), allowNull: false, defaultValue: 'assigned' },
    picked_at: DataTypes.DATE,
    delivered_at: DataTypes.DATE
  }, {
    tableName: 'deliveries',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Delivery.associate = models => {
    Delivery.belongsTo(models.Order, { foreignKey: 'order_id' });
    Delivery.belongsTo(models.Courier, { foreignKey: 'courier_id' });
  };

  return Delivery;
};