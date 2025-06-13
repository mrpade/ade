module.exports = (sequelize, DataTypes) => {
  const PharmacyStock = sequelize.define('PharmacyStock', {
    pharmacy_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false }
  }, {
    tableName: 'pharmacy_stock',
    underscored: true,
    timestamps: false
  });

  return PharmacyStock;
};
