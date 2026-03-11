import Sequelize, { Model } from 'sequelize';
import Teacher from './Teacher.js';

export default class Task extends Model {
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
              msg: 'O título da tarefa é obrigatório'
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
              args: [0, 5000],
              msg: 'A descrição pode ter no máximo 5000 caracteres'
            }
          }
        },

        deadline: {
          type: Sequelize.DATE,
          allowNull: false,
          validate: {
            isDate: {
              msg: 'Deadline deve ser uma data válida'
            },
            isAfterToday(value) {
              const today = new Date();
              if (new Date(value) <= today) {
                throw new Error('O prazo deve ser uma data futura');
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
        modelName: 'Task',
        tableName: 'tasks',
        underscored: true,
        hooks: {
          beforeCreate: async (task) => {
            const teacher = await Teacher.findByPk(task.teacher_id);
            if (!teacher) {
              throw new Error('Professor inválido');
            }
          }
        }
      }
    );

    return this;
  }

  static associate(models) {
    /**
     * Uma tarefa pertence a um professor
     */
    this.belongsTo(models.Teacher, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    });

    Task.hasMany(models.Submission, { foreignKey: 'task_id', as: 'submissions' });

  }
}
