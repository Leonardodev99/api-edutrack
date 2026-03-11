import { Router } from 'express';
import TaskController from '../controllers/TaskController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// 🔒 Todas as rotas exigem autenticação
router.use(authMiddleware);

// 📌 Rotas restritas a professores
router.post('/', roleMiddleware('professor'), TaskController.store);
router.put('/:id', roleMiddleware('professor'), TaskController.update);
router.delete('/:id', roleMiddleware('professor'), TaskController.delete);

// 📌 Rotas de listagem e consulta → todos autenticados
router.get('/', TaskController.index);
router.get('/:id', TaskController.show);

// 🔹 Submissions de uma tarefa (opcional, pode ser protegido posteriormente)
router.get('/:id/submissions', roleMiddleware('professor', 'gestor'), TaskController.show);

export default router;
