import Sequelize, { Model } from 'sequelize';
import User from './User.js';

export default class Student extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            async isAluno(value) {
              const user = await User.findByPk(value);
              if (!user) {
                throw new Error('Usuário não encontrado');
              }
              if (user.tipo !== 'aluno') {
                throw new Error('Só é possível criar Student para usuários do tipo aluno');
              }
            }
          }
        },

        matricula: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: {
            msg: 'Matrícula já existe'
          },
          validate: {
            len: {
              args: [5, 20],
              msg: 'A matrícula deve ter entre 5 e 20 caracteres'
            }
          }
        },

        curso: {
          type: Sequelize.STRING(100),
          allowNull: false,
          validate: {
            len: {
              args: [3, 100],
              msg: 'O nome do curso deve ter entre 3 e 100 caracteres'
            }
          }
        },

        ano_ingresso: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            isInt: {
              msg: 'Ano de ingresso deve ser um número inteiro'
            },
            min: {
              args: 1900,
              msg: 'Ano de ingresso inválido'
            },
            max: {
              args: new Date().getFullYear(),
              msg: 'Ano de ingresso inválido'
            }
          }
        },
        class_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'classes',
            key: 'id'
          }
        },
        foto: {
          type: Sequelize.STRING,
          allowNull: true
        },

        ativo: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        }
      },
      {
        sequelize,
        modelName: 'Student',
        tableName: 'students',
        underscored: true,
        hooks: {
          beforeCreate: async (student) => {
            const user = await User.findByPk(student.user_id);
            if (!user || user.tipo !== 'aluno') {
              throw new Error('Só é possível criar Student para usuários do tipo aluno');
            }
          }
        }
      }
    );

    return this;
  }

  static associate(models) {
    // Associação 1:1 com User
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsToMany(models.Guardian, {
      through: 'student_guardians',
      foreignKey: 'student_id',
      otherKey: 'guardian_id',
      as: 'guardians'
    });
  }
}
