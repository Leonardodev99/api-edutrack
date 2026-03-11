import Sequelize, { Model }  from 'sequelize';
import User from './User';


export default class Guardian extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            async isEncarregado(value) {
              const user = await User.findByPk(value);
              if (!user) {
                throw new Error('Usuário não encontrado');
              }
              if (user.tipo !== 'encarregado') {
                throw new Error('Só é possível criar Guardian para usuários do tipo encarregado');
              }
            }
          }
        },
        telefone: {
          type: Sequelize.STRING,
          allowNull: false,
          set(value) {
            // Remove qualquer espaço antes de salvar
            if (value) {
              this.setDataValue('telefone', value.replace(/\s+/g, ''));
            }
          },
          validate: {
            notEmpty: {
              msg: 'O telefone é obrigatório'
            },
            isNumeric: {
              msg: 'O telefone deve conter apenas números'
            },
            len: {
              args: [9, 9],
              msg: 'O telefone deve ter exatamente 9 dígitos'
            },
            isValidFormat(value) {
              // Deve começar com 9
              if (!/^9\d{8}$/.test(value)) {
                throw new Error(
                  'O telefone deve estar no formato 9XX XXX XXX e começar com 9'
                );
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
        modelName: 'Guardian',
        tableName: 'guardians',
        underscored: true,
        timestamps: true,
        hooks: {
          beforeCreate: async (guardian) => {
            const user = await User.findByPk(guardian.user_id);
            if (!user || user.tipo !== 'encarregado') {
              throw new Error('Só é possível criar Guardian para usuários do tipo encarregado');
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
    // Guardian pode acompanhar vários alunos (N:N)
    this.belongsToMany(models.Student, {
      through: 'student_guardians',
      foreignKey: 'guardian_id',
      otherKey: 'student_id',
      as: 'students'
    });
  };

}

