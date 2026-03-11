import Sequelize, { Model } from 'sequelize';

export default class Class extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: Sequelize.STRING(50),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'O nome da turma é obrigatório'
            },
            len: {
              args: [2, 50],
              msg: 'O nome da turma deve ter entre 2 e 50 caracteres'
            }
          }
        },

        ano_letivo: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            isInt: {
              msg: 'Ano letivo deve ser um número inteiro'
            },
            min: {
              args: 2000,
              msg: 'Ano letivo inválido'
            },
            max: {
              args: new Date().getFullYear() + 1,
              msg: 'Ano letivo inválido'
            }
          }
        },

        curso: {
          type: Sequelize.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'O curso é obrigatório'
            },
            len: {
              args: [3, 100],
              msg: 'O nome do curso deve ter entre 3 e 100 caracteres'
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
        modelName: 'Class',
        tableName: 'classes',
        underscored: true,
        timestamps: true
      }
    );

    return this;
  }

  static associate(models) {
    // Uma turma pertence a um professor responsável
    this.belongsTo(models.Teacher, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    });

    // Uma turma tem vários alunos
    this.hasMany(models.Student, {
      foreignKey: 'class_id',
      as: 'students'
    });
  }
}
