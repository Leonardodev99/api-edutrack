import { Router } from 'express';
import MessageController from '../controllers/MessageController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// 🔒 Todas as rotas exigem autenticação
router.use(authMiddleware);

// 📤 Enviar mensagem → todos podem enviar, mas só para perfis permitidos
router.post(
  '/',
  MessageController.store
);

// 📥 Inbox → todos podem ver suas mensagens recebidas
router.get(
  '/inbox/:userId',
  (req, res, next) => {
    if (req.userId != req.params.userId) {
      return res.status(403).json({ error: 'Acesso negado: só pode ver seu próprio inbox' });
    }
    next();
  },
  MessageController.inbox
);

// ✅ Marcar como lida → só o destinatário pode marcar como lida
router.put(
  '/:id/read',
  MessageController.markAsRead
);

// 🔹 Chat entre encarregado e escola (professor ou gestor)
router.get(
  '/chat/encarregado-escola/:userId',
  roleMiddleware('encarregado', 'professor', 'gestor'),
  MessageController.chatEncarregadoEscola
);

// 🔹 Chat entre professor e aluno
router.get(
  '/chat/professor-aluno/:userId',
  roleMiddleware('professor', 'aluno'),
  MessageController.chatProfessorAluno
);

// 🔹 Listar todos os interlocutores de um usuário
router.get(
  '/interlocutors/:userId',
  MessageController.interlocutors
);

// 🔹 Deletar mensagem → apenas o remetente pode deletar
router.delete(
  '/:id',
  MessageController.delete
);

export default router;
