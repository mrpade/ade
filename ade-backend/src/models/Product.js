module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    form: DataTypes.STRING(100),
    dosage: DataTypes.STRING(100),
    atc_code: DataTypes.STRING(50)
  }, {
    tableName: 'products',
    underscored: true,
    timestamps: false
  });

  return Product;
};