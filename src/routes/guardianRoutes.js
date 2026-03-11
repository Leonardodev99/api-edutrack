import { Router } from 'express';
import GuardianController from '../controllers/GuardianController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// 🔐 Criar → só gestor
router.post(
  '/',
  authMiddleware,
  roleMiddleware('gestor'),
  GuardianController.store
);

// 🔐 Listar todos → só gestor
router.get(
  '/',
  authMiddleware,
  roleMiddleware('gestor'),
  GuardianController.index
);

// 🔐 Ver perfil → encarregado ou gestor
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('encarregado', 'gestor'),
  GuardianController.show
);

// 🔐 Atualizar → encarregado ou gestor
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('encarregado', 'gestor'),
  GuardianController.update
);

// 🔐 Desativar → só gestor
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('gestor'),
  GuardianController.delete
);

export default router;
