import Message from '../models/Message.js';
import User from '../models/User.js';

class MessageController {
  // 📤 Enviar mensagem
  async store(req, res) {
    try {
      const { sender_id, receiver_id, content } = req.body;

      if (!sender_id || !receiver_id || !content) {
        return res.status(400).json({ error: 'sender_id, receiver_id e content são obrigatórios' });
      }

      if (sender_id === receiver_id) {
        return res.status(400).json({ error: 'Não é possível enviar mensagem para si mesmo' });
      }

      const message = await Message.create({ sender_id, receiver_id, content });
      return res.status(201).json(message);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // 📥 Inbox (mensagens recebidas)
  async inbox(req, res) {
    try {
      const { userId } = req.params;

      const messages = await Message.findAll({
        where: { receiver_id: userId },
        include: [{ model: User, as: 'sender', attributes: ['id', 'nome', 'email', 'tipo'] }],
        order: [['created_at', 'DESC']],
      });

      if (messages.length === 0) {
        return res.json({ message: 'Nenhuma mensagem recebida', data: [] });
      }

      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar inbox', details: error.message });
    }
  }

  // ✅ Marcar mensagem como lida
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const message = await Message.findByPk(id);
      if (!message) return res.status(404).json({ error: 'Mensagem não encontrada' });

      if (message.read) return res.json({ message: 'Mensagem já estava marcada como lida' });

      await message.update({ read: true });
      return res.json({ message: 'Mensagem marcada como lida com sucesso', data: message });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao marcar mensagem como lida', details: error.message });
    }
  }

  // 🔹 Chat entre encarregado e escola (professor ou gestor)
  async chatEncarregadoEscola(req, res) {
    try {
      const { userId } = req.params; // usuário logado (encarregado)
      const { interlocutorId } = req.query; // professor ou gestor

      const messages = await Message.findAll({
        where: {
          sender_id: [userId, interlocutorId],
          receiver_id: [userId, interlocutorId],
        },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'nome', 'tipo'] },
          { model: User, as: 'receiver', attributes: ['id', 'nome', 'tipo'] },
        ],
        order: [['created_at', 'ASC']],
      });

      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar chat encarregado-escola', details: error.message });
    }
  }

  // 🔹 Chat entre professor e aluno
  async chatProfessorAluno(req, res) {
    try {
      const { userId } = req.params; // usuário logado (professor)
      const { interlocutorId } = req.query; // aluno

      const messages = await Message.findAll({
        where: {
          sender_id: [userId, interlocutorId],
          receiver_id: [userId, interlocutorId],
        },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'nome', 'tipo'] },
          { model: User, as: 'receiver', attributes: ['id', 'nome', 'tipo'] },
        ],
        order: [['created_at', 'ASC']],
      });

      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar chat professor-aluno', details: error.message });
    }
  }

  // 🔹 Listar todos os interlocutores de um usuário
  async interlocutors(req, res) {
    try {
      const { userId } = req.params;

      const users = await Message.sequelize.query(
        `
        SELECT DISTINCT u.id, u.nome, u.tipo
        FROM users u
        JOIN messages m
          ON (m.sender_id = u.id OR m.receiver_id = u.id)
        WHERE (m.sender_id = :userId OR m.receiver_id = :userId) AND u.id != :userId
        `,
        { replacements: { userId }, type: Message.sequelize.QueryTypes.SELECT }
      );

      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar interlocutores', details: error.message });
    }
  }

  // 🔹 Deletar mensagem enviada
  async delete(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body; // quem está solicitando a exclusão

      const message = await Message.findByPk(id);
      if (!message) return res.status(404).json({ error: 'Mensagem não encontrada' });

      if (message.sender_id != userId) return res.status(403).json({ error: 'Só o remetente pode deletar a mensagem' });

      await message.destroy();
      return res.json({ message: 'Mensagem deletada com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar mensagem', details: error.message });
    }
  }
}

export default new MessageController();
