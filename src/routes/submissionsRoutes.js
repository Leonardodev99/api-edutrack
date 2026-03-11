import { Router } from 'express';
import SubmissionController from '../controllers/SubmissionController.js';
import SubmissionAdvancedController from '../controllers/SubmissionAdvancedController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// 📌 Criar submissão → apenas aluno
router.post(
  '/',
  authMiddleware,
  roleMiddleware('aluno'),
  SubmissionController.store
);

// 📌 Listar submissões → aluno, professor, gestor
router.get(
  '/',
  authMiddleware,
  roleMiddleware('aluno', 'professor', 'gestor'),
  SubmissionController.index
);

// 🔹 Submissões pendentes → professor ou gestor
router.get(
  '/pending',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  SubmissionAdvancedController.pending
);

// 📌 Buscar submissão → aluno, professor, gestor
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('aluno', 'professor', 'gestor'),
  SubmissionController.show
);

// 📌 Atualizar submissão → professor ou gestor
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  SubmissionController.update
);

// 📌 Deletar submissão → apenas gestor
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('gestor'),
  SubmissionController.delete
);

export default router;
