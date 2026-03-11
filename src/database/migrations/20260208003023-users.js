'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      nome: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },

      senha: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      tipo: {
        type: Sequelize.ENUM('aluno', 'professor', 'gestor'),
        allowNull: false
      },

      ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },


      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        )
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
