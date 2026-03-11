import Sequelize, { Model } from 'sequelize';
import User from './User.js';


export default class Teacher extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            async isProfessor(value) {
              const user = await User.findByPk(value);
              if (!user) {
                throw new Error('Usuário não encontrado');
              }
              if (user.tipo !== 'professor') {
                throw new Error('Só é possível criar Teacher para usuários do tipo professor');
              }
            }
          }
        },

        departamento: {
          type: Sequelize.STRING(100),
          allowNull: false,
          validate: {
            len: {
              args: [3, 100],
              msg: 'O departamento deve ter entre 3 e 100 caracteres'
            }
          }
        },

        disciplina: {
          type: Sequelize.STRING(100),
          allowNull: false,
          validate: {
            len: {
              args: [3, 100],
              msg: 'A disciplina deve ter entre 3 e 100 caracteres'
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
        modelName: 'Teacher',
        tableName: 'teachers',
        underscored: true,
        hooks: {
          beforeCreate: async (teacher) => {
            const user = await User.findByPk(teacher.user_id);
            if (!user || user.tipo !== 'professor') {
              throw new Error('Só é possível criar Teacher para usuários do tipo professor');
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
    this.hasMany(models.Material, { foreignKey: 'teacher_id', as: 'materials' });

  }

}
