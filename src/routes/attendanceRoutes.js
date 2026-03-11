import { Router } from 'express';
import AttendanceController from '../controllers/AttendanceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// 🔐 Criar presença → professor ou gestor
router.post(
  '/',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  AttendanceController.store
);

// 🔐 Criar em massa → professor ou gestor
router.post(
  '/bulk',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  AttendanceController.bulkCreate
);

// 🔐 Listar todas → só gestor
router.get(
  '/',
  authMiddleware,
  roleMiddleware('gestor'),
  AttendanceController.index
);

// 🔐 Buscar por ID → professor ou gestor
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  AttendanceController.show
);

// 🔐 Atualizar → professor ou gestor
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('professor', 'gestor'),
  AttendanceController.update
);

// 🔐 Remover → só gestor
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('gestor'),
  AttendanceController.delete
);

export default router;
