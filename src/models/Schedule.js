import Sequelize, { Model, Op } from 'sequelize';

export default class Schedule extends Model {
  static init(sequelize) {
    super.init(
      {
        class_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            notNull: {
              msg: 'A turma é obrigatória'
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

        disciplina: {
          type: Sequelize.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'A disciplina é obrigatória'
            }
          }
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
          allowNull: false,
          validate: {
            isAfterStart(value) {
              if (value <= this.hora_inicio) {
                throw new Error('Hora fim deve ser maior que hora início');
              }
            }
          }
        },

        sala: {
          type: Sequelize.STRING(50),
          allowNull: true
        },

        ativo: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        }
      },
      {
        sequelize,
        modelName: 'Schedule',
        tableName: 'schedules',
        underscored: true,
        timestamps: true,

        hooks: {
          beforeCreate: async (schedule) => {
            await Schedule.validateConflict(schedule);
          },

          beforeUpdate: async (schedule) => {
            await Schedule.validateConflict(schedule);
          }
        }
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'class'
    });

    this.belongsTo(models.Teacher, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    });
  }

  /**
   * 🔥 Validação inteligente de conflito de horário
   */
  static async validateConflict(schedule) {
    const conflict = await Schedule.findOne({
      where: {
        id: { [Op.ne]: schedule.id || null }, // ignora o próprio no update
        dia_semana: schedule.dia_semana,
        ativo: true,
        [Op.and]: [
          {
            hora_inicio: { [Op.lt]: schedule.hora_fim }
          },
          {
            hora_fim: { [Op.gt]: schedule.hora_inicio }
          }
        ],
        [Op.or]: [
          { teacher_id: schedule.teacher_id }, // conflito do professor
          { class_id: schedule.class_id } // conflito da turma
        ]
      }
    });

    if (conflict) {
      throw new Error(
        'Conflito de horário detectado para esta turma ou professor'
      );
    }
  }
}
