'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'tipo', {
      type: Sequelize.ENUM('aluno', 'professor', 'gestor', 'encarregado'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'tipo', {
      type: Sequelize.ENUM('aluno', 'professor', 'gestor'),
      allowNull: false
    });
  }
};
