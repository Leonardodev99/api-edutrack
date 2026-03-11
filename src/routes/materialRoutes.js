import { Router } from 'express';
import MaterialController from '../controllers/MaterialController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// 🔐 Criar material → apenas professor
router.post(
  '/',
  authMiddleware,
  roleMiddleware('professor'),
  MaterialController.store
);

// 📖 Listar materiais → público (ou autenticado)
router.get('/', authMiddleware, MaterialController.index);

// 📖 Buscar material → público (ou autenticado)
router.get('/:id', authMiddleware, MaterialController.show);

// 🔐 Atualizar material → apenas professor
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('professor'),
  MaterialController.update
);

// 🔐 Remover material → apenas professor
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('professor'),
  MaterialController.delete
);

export default router;
