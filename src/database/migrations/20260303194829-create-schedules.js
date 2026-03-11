'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schedules', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teachers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      disciplina: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      dia_semana: {
        type: Sequelize.ENUM(
          'segunda',
          'terca',
          'quarta',
          'quinta',
          'sexta',
          'sabado'
        ),
        allowNull: false
      },

      hora_inicio: {
        type: Sequelize.TIME,
        allowNull: false
      },

      hora_fim: {
        type: Sequelize.TIME,
        allowNull: false
      },

      sala: {
        type: Sequelize.STRING(50),
        allowNull: true
      },

      ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('schedules');
  }
};
