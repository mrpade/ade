'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserQuestionResponse = sequelize.define('UserQuestionResponse', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    question_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    selected_option_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'user_question_responses',
    underscored: true,
    timestamps: false
  });
  UserQuestionResponse.associate = models => {
    UserQuestionResponse.belongsTo(models.User, { foreignKey: 'user_id' });
    UserQuestionResponse.belongsTo(models.Question, { foreignKey: 'question_id' });
    UserQuestionResponse.belongsTo(models.QuestionOption, { foreignKey: 'selected_option_id' });
  };
  return UserQuestionResponse;
};