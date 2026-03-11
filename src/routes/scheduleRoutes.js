import { Router } from 'express';
import ScheduleController from '../controllers/ScheduleController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const routes = new Router();

// 🔐 Todas as rotas exigem autenticação
routes.use(authMiddleware);

// 📌 Criar horário → apenas gestor
routes.post(
  '/',
  roleMiddleware('gestor'),
  ScheduleController.store
);

// 📌 Atualizar horário → apenas gestor
routes.put(
  '/:id',
  roleMiddleware('gestor'),
  ScheduleController.update
);

// 📌 Deletar horário → apenas gestor
routes.delete(
  '/:id',
  roleMiddleware('gestor'),
  ScheduleController.delete
);

// 📌 Listar horários → todos autenticados
routes.get('/', ScheduleController.index);

// 📌 Buscar horário por ID → todos autenticados
routes.get('/:id', ScheduleController.show);

export default routes;
