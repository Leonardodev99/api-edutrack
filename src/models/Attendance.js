import Sequelize, { Model } from 'sequelize';

export default class Attendance extends Model {
  static init(sequelize) {
    super.init(
      {
        student_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            notNull: {
              msg: 'O aluno é obrigatório'
            }
          }
        },

        schedule_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            notNull: {
              msg: 'O horário da aula é obrigatório'
            }
          }
        },

        teacher_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            notNull: {
              msg: 'O professor é obrigatório'
            }
          }
        },

        data_aula: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          validate: {
            notNull: {
              msg: 'A data da aula é obrigatória'
            },
            isDate: {
              msg: 'Data inválida'
            }
          }
        },

        presente: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          validate: {
            notNull: {
              msg: 'É necessário informar se o aluno esteve presente'
            }
          }
        },

        observacao: {
          type: Sequelize.TEXT,
          allowNull: true
        }
      },
      {
        sequelize,
        modelName: 'Attendance',
        tableName: 'attendances',
        underscored: true,
        timestamps: true
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student'
    });

    this.belongsTo(models.Schedule, {
      foreignKey: 'schedule_id',
      as: 'schedule'
    });

    this.belongsTo(models.Teacher, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    });
  }
}
