'use strict';
module.exports = (sequelize, DataTypes) => {
  const OptionImpact = sequelize.define('OptionImpact', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    option_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    disease_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    score_delta: { type: DataTypes.DECIMAL(4,2), allowNull: false }
  }, {
    tableName: 'option_impacts',
    underscored: true,
    timestamps: false
  });
  OptionImpact.associate = models => {
    OptionImpact.belongsTo(models.QuestionOption, { foreignKey: 'option_id' });
    OptionImpact.belongsTo(models.DiseasesList, { foreignKey: 'disease_id' });
  };
  return OptionImpact;
};
