'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'schedules',
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

      data_aula: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      presente: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },

      observacao: {
        type: Sequelize.TEXT,
        allowNull: true
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

    /**
     * 🔥 Índice único para impedir duplicação
     * Mesmo aluno + mesma aula + mesma data
     */
    await queryInterface.addConstraint('attendances', {
      fields: ['student_id', 'schedule_id', 'data_aula'],
      type: 'unique',
      name: 'unique_attendance_per_class'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('attendances');
  }
};
