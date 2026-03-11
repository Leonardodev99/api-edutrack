import { Router } from 'express';
import ClassController from '../controllers/ClassController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// 🔐 Criar turma → só gestor
router.post(
  '/',
  authMiddleware,
  roleMiddleware('gestor'),
  ClassController.store
);

// 🔐 Listar turmas → professor ou gestor
router.get(
  '/',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  ClassController.index
);

// 🔐 Matricular aluno → só gestor
router.post(
  '/:classId/enroll',
  authMiddleware,
  roleMiddleware('gestor'),
  ClassController.enrollStudent
);

// 🔐 Buscar turma → professor ou gestor
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  ClassController.show
);

// 🔐 Atualizar turma → só gestor
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('gestor'),
  ClassController.update
);

// 🔐 Desativar turma → só gestor
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('gestor'),
  ClassController.delete
);

export default router;
