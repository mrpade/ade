'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('symptoms', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(255), allowNull: false, unique: true }
    });
    await queryInterface.addIndex('symptoms', ['name'], { type: 'FULLTEXT', name: 'symptoms_name_fulltext' });

    await queryInterface.createTable('disease_symptoms', {
      disease_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'Diseases_list', key: 'id' },
        onDelete: 'CASCADE'
      },
      symptom_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'symptoms', key: 'id' },
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.addConstraint('disease_symptoms', {
      fields: ['disease_id', 'symptom_id'],
      type: 'primary key',
      name: 'pk_disease_symptoms'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('disease_symptoms');
    await queryInterface.dropTable('symptoms');
  }
};