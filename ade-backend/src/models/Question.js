'use strict';
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    question_text: { type: DataTypes.TEXT, allowNull: false },
    question_type: {
      type: DataTypes.ENUM('yes_no', 'multiple_choice', 'number', 'scale'),
      defaultValue: 'yes_no'
    },
    trigger_symptom_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {
    tableName: 'questions',
    underscored: true,
    timestamps: false
  });
  Question.associate = models => {
    Question.belongsTo(models.Symptom, { foreignKey: 'trigger_symptom_id' });
    Question.hasMany(models.QuestionOption, { foreignKey: 'question_id', as: 'options' });
  };
  return Question;
};