module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define('Doctor', {
    user_id:    { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    speciality: { type: DataTypes.STRING(100), allowNull: false },
    onmc:       { type: DataTypes.STRING(50),  allowNull: false, unique: true },
    workplace:  DataTypes.STRING(255),
    is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    bio: DataTypes.TEXT
  }, {
    tableName: 'doctors',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Doctor.associate = models => {
    Doctor.belongsTo(models.User, { foreignKey: 'user_id', as: 'account' });
  };
  return Doctor;
};