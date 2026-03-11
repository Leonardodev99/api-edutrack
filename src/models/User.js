import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

export default class User extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },

        nome: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            len: {
              args: [5, 150],
              msg: 'O nome deve ter entre 5 e 150 caracteres'
            },
            isNotStartWithNumber(value) {
              if (/^\d/.test(value)) {
                throw new Error('O nome não pode começar com número');
              }
            }
          }
        },

        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: {
            msg: 'Email já existe'
          },
          validate: {
            isEmail: {
              msg: 'Email inválido'
            }
          }
        },

        senha: {
          type: Sequelize.STRING,
          allowNull: false
        },

        tipo: {
          type: Sequelize.ENUM('aluno', 'professor', 'gestor', 'encarregado'),
          allowNull: false
        },

        ativo: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        }
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',

        hooks: {
          beforeCreate: async (user) => {
            user.senha = await bcrypt.hash(user.senha, 10);
          },

          beforeUpdate: async (user) => {
            if (user.changed('senha')) {
              user.senha = await bcrypt.hash(user.senha, 10);
            }
          }
        }
      }
    );

    return this;
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.senha);
  }
}
