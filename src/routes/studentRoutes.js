import { Router } from 'express';
import StudentController from '../controllers/StudentController';
import StudentAdvancedController from '../controllers/StudentAdvancedController';
import upload from '../middlewares/upload';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// 🔒 Todas as rotas exigem autenticação
router.use(authMiddleware);

// 📌 Rotas restritas a gestores
router.post('/', roleMiddleware('gestor'), StudentController.store);
router.put('/:id', roleMiddleware('gestor'), StudentController.update);
router.delete('/:id', roleMiddleware('gestor'), StudentController.delete);
router.post('/:id/photo', roleMiddleware('gestor'), upload.single('file'), StudentController.uploadPhoto);

// 📌 Rotas de listagem e consulta → gestor ou professor
router.get('/', roleMiddleware('gestor', 'professor'), StudentController.index);
router.get('/:id', roleMiddleware('gestor', 'professor'), StudentController.show);

// 🔹 Rotas de aluno (cada aluno acessa apenas os próprios dados)
router.get('/:studentId/grades', roleMiddleware('aluno', 'professor', 'gestor'), (req, res, next) => {
  if (req.userRole === 'aluno' && req.userId != req.params.studentId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}, StudentAdvancedController.grades);

router.get('/:studentId/report', roleMiddleware('aluno', 'professor', 'gestor'), (req, res, next) => {
  if (req.userRole === 'aluno' && req.userId != req.params.studentId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}, StudentAdvancedController.report);

router.get('/:studentId/submissions', roleMiddleware('aluno', 'professor', 'gestor'), (req, res, next) => {
  if (req.userRole === 'aluno' && req.userId != req.params.studentId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}, StudentAdvancedController.submissions);

export default router;
