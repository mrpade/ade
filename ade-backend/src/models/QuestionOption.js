'use strict';
module.exports = (sequelize, DataTypes) => {
  const QuestionOption = sequelize.define('QuestionOption', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    question_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    option_label: { type: DataTypes.STRING(100), allowNull: false }
  }, {
    tableName: 'question_options',
    underscored: true,
    timestamps: false
  });
  QuestionOption.associate = models => {
    QuestionOption.belongsTo(models.Question, { foreignKey: 'question_id' });
    QuestionOption.hasMany(models.OptionImpact, { foreignKey: 'option_id', as: 'impacts' });
  };
  return QuestionOption;
};