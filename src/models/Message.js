import Sequelize, { Model } from 'sequelize';
import User from './User.js';

export default class Message extends Model {
  static init(sequelize) {
    super.init(
      {
        sender_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            async isValidSender(value) {
              const user = await User.findByPk(value);
              if (!user) {
                throw new Error('Remetente não encontrado');
              }
            },
          },
        },

        receiver_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            async isValidReceiver(value) {
              const user = await User.findByPk(value);
              if (!user) {
                throw new Error('Destinatário não encontrado');
              }
            },
          },
        },

        content: {
          type: Sequelize.TEXT,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'A mensagem não pode estar vazia',
            },
            len: {
              args: [1, 5000],
              msg: 'A mensagem deve ter entre 1 e 5000 caracteres',
            },
          },
        },

        read: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: 'Message',
        tableName: 'messages',
        underscored: true,

        hooks: {
          /**
           * Impede envio de mensagem para si mesmo
           */
          beforeCreate: async (message) => {
            if (message.sender_id === message.receiver_id) {
              throw new Error('Não é possível enviar mensagem para si mesmo');
            }
          },
        },
      }
    );

    return this;
  }

  static associate(models) {
    /**
     * Mensagem pertence ao remetente (User)
     */
    this.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender',
    });

    /**
     * Mensagem pertence ao destinatário (User)
     */
    this.belongsTo(models.User, {
      foreignKey: 'receiver_id',
      as: 'receiver',
    });
  }
}
