module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    order_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    qty: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    unit_price: { type: DataTypes.DECIMAL(10,2), allowNull: false }
  }, {
    tableName: 'order_items',
    underscored: true,
    timestamps: false
  });

  return OrderItem;
};