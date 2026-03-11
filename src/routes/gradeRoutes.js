import { Router } from 'express';
import GradeController from '../controllers/GradeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// Criar nota → professor ou gestor
router.post(
  '/',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  GradeController.store
);

// Listar notas → aluno, professor ou gestor
router.get(
  '/',
  authMiddleware,
  roleMiddleware('aluno', 'professor', 'gestor'),
  GradeController.index
);

// Ver nota específica
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('aluno', 'professor', 'gestor'),
  GradeController.show
);

// Atualizar nota → professor ou gestor
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  GradeController.update
);

// Remover nota → professor ou gestor
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  GradeController.delete
);

export default router;
