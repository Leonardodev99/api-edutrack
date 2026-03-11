import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// 🔓 Criar utilizador (regra já está dentro do controller)
router.post('/', UserController.store);

// 🔐 Perfil próprio
router.get('/me', authMiddleware, UserController.profile);

// 🔐 Listar todos → só gestor
router.get('/', authMiddleware, roleMiddleware('gestor'), UserController.index);

// 🔐 Mostrar utilizador por ID → SÓ GESTOR
router.get('/:id', authMiddleware, roleMiddleware('gestor'), UserController.show);

// 🔐 Atualizar → só gestor
router.put('/:id', authMiddleware, roleMiddleware('gestor'), UserController.update);

// 🔐 Remover → só gestor
router.delete('/:id', authMiddleware, roleMiddleware('gestor'), UserController.delete);

export default router;
