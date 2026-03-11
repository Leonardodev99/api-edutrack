'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'foto', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'class_id' // opcional (funciona no MySQL)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('students', 'foto');
  }
};
