module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    role: {
      type: DataTypes.ENUM('patient','doctor','pharmacy','courier', 'admin'),
      allowNull: false,
      defaultValue: 'patient'
    },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    first_name: DataTypes.STRING(100),
    last_name:  DataTypes.STRING(100),
    birthdate:  DataTypes.DATEONLY,
    reset_token:  DataTypes.STRING(255),
    reset_expires: DataTypes.DATE
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return User
};