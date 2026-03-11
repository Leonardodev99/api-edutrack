'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove a coluna `grade` da tabela `submissions`
    await queryInterface.removeColumn('submissions', 'grade');
  },

  async down(queryInterface, Sequelize) {
    // Caso queira desfazer a migração, adiciona novamente a coluna
    await queryInterface.addColumn('submissions', 'grade', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },
};
