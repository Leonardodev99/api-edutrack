'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_guardians', {
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      guardian_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'guardians', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addConstraint('student_guardians', {
      fields: ['student_id', 'guardian_id'],
      type: 'primary key',
      name: 'student_guardians_pk'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_guardians');
  }
};
