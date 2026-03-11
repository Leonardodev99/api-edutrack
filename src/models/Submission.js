import Sequelize, { Model } from 'sequelize';
import Task from './Task.js';
import Student from './Student.js';

export default class Submission extends Model {
  static init(sequelize) {
    super.init(
      {
        task_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            async isValidTask(value) {
              const task = await Task.findByPk(value);
              if (!task) {
                throw new Error('Tarefa não encontrada');
              }
            },
          },
        },

        student_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            async isValidStudent(value) {
              const student = await Student.findByPk(value);
              if (!student) {
                throw new Error('Aluno não encontrado');
              }
            },
          },
        },

        content: {
          type: Sequelize.TEXT,
          allowNull: true,
          validate: {
            len: {
              args: [0, 5000],
              msg: 'O conteúdo da submissão pode ter no máximo 5000 caracteres',
            },
          },
        },

        file_url: {
          type: Sequelize.STRING(255),
          allowNull: true,
          validate: {
            isUrlOrPath(value) {
              if (value && value.length < 5) {
                throw new Error('Link do arquivo inválido');
              }
            },
          },
        },

        /*grade: {
          type: Sequelize.FLOAT,
          allowNull: true,
          validate: {
            min: {
              args: [0],
              msg: 'A nota mínima é 0',
            },
            max: {
              args: [20],
              msg: 'A nota máxima é 20',
            },
          },
        },*/

        feedback: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        status: {
          type: Sequelize.ENUM('pending', 'submitted', 'graded'),
          allowNull: false,
          defaultValue: 'pending',
        },
      },
      {
        sequelize,
        modelName: 'Submission',
        tableName: 'submissions',
        underscored: true,

        hooks: {
          /**
           * Impede submissão duplicada
           * (mesmo aluno + mesma tarefa)
           */
          beforeCreate: async (submission) => {
            const exists = await Submission.findOne({
              where: {
                task_id: submission.task_id,
                student_id: submission.student_id,
              },
            });

            if (exists) {
              throw new Error(
                'Este aluno já submeteu esta tarefa'
              );
            }
          },
        },
      }
    );

    return this;
  }

  static associate(models) {
  // Submissão pertence a tarefa
    this.belongsTo(models.Task, { foreignKey: 'task_id', as: 'task' });

    // Submissão pertence a aluno
    this.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });

    // Submissão tem 1 grade
    this.hasOne(models.Grade, { foreignKey: 'submission_id', as: 'grade' });
  }

}
