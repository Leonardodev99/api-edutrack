import Sequelize, { Model } from 'sequelize';
import Teacher from './Teacher.js';

export default class Material extends Model {
  static init(sequelize) {
    super.init(
      {
        teacher_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            async isValidTeacher(value) {
              const teacher = await Teacher.findByPk(value);
              if (!teacher) {
                throw new Error('Professor não encontrado');
              }
            }
          }
        },

        title: {
          type: Sequelize.STRING(150),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'O título é obrigatório'
            },
            len: {
              args: [3, 150],
              msg: 'O título deve ter entre 3 e 150 caracteres'
            }
          }
        },

        description: {
          type: Sequelize.TEXT,
          allowNull: true,
          validate: {
            len: {
              args: [0, 1000],
              msg: 'A descrição não pode ultrapassar 1000 caracteres'
            }
          }
        },

        file_url: {
          type: Sequelize.STRING(255),
          allowNull: true,
          validate: {
            isUrlOrPath(value) {
              if (value && value.length < 5) {
                throw new Error('O link do material é inválido');
              }
            }
          }
        },

        ativo: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        }
      },
      {
        sequelize,
        modelName: 'Material',
        tableName: 'materials',
        underscored: true,

        hooks: {
          beforeCreate: async (material) => {
            const teacher = await Teacher.findByPk(material.teacher_id);
            if (!teacher) {
              throw new Error('Professor inválido para este material');
            }
          }
        }
      }
    );

    return this;
  }

  static associate(models) {
    // Material pertence a um Professor
    this.belongsTo(models.Teacher, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    });
  }
}
