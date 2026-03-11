'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'class_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'classes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('students', 'class_id');
  }
};
