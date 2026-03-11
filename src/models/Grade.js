import Sequelize, { Model } from 'sequelize';
import Submission from './Submission.js';
import Teacher from './Teacher.js';

export default class Grade extends Model {
  static init(sequelize) {
    super.init(
      {
        submission_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: {
            msg: 'Esta submissão já possui uma nota',
          },
          validate: {
            async isValidSubmission(value) {
              const submission = await Submission.findByPk(value);
              if (!submission) {
                throw new Error('Submissão não encontrada');
              }
            },
          },
        },

        teacher_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            async isValidTeacher(value) {
              const teacher = await Teacher.findByPk(value);
              if (!teacher) {
                throw new Error('Professor não encontrado');
              }
            },
          },
        },

        score: {
          type: Sequelize.FLOAT,
          allowNull: false,
          validate: {
            min: {
              args: [0],
              msg: 'A nota não pode ser negativa',
            },
            max: {
              args: [20],
              msg: 'A nota não pode ser maior que 20',
            },
          },
        },

        feedback: {
          type: Sequelize.TEXT,
          allowNull: true,
          validate: {
            len: {
              args: [0, 2000],
              msg: 'O feedback pode ter no máximo 2000 caracteres',
            },
          },
        },
      },
      {
        sequelize,
        modelName: 'Grade',
        tableName: 'grades',
        underscored: true,

        hooks: {
          beforeCreate: async (grade) => {
            const submission = await Submission.findByPk(grade.submission_id);
            if (!submission) {
              throw new Error('Submissão inválida');
            }

            const teacher = await Teacher.findByPk(grade.teacher_id);
            if (!teacher) {
              throw new Error('Professor inválido');
            }
          },
        },
      }
    );

    return this;
  }

  static associate(models) {
    /**
     * Uma nota pertence a uma submissão
     */
    this.belongsTo(models.Submission, {
      foreignKey: 'submission_id',
      as: 'submission',
    });

    /**
     * Uma nota pertence a um professor
     */
    this.belongsTo(models.Teacher, {
      foreignKey: 'teacher_id',
      as: 'teacher',
    });
  }
}
