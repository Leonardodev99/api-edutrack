import { Router } from 'express';
import TeacherController from '../controllers/TeacherController.js';
import TeacherAdvancedController from '../controllers/TeacherAdvancedController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = new Router();

// 🔒 Todas as rotas exigem autenticação
router.use(authMiddleware);

// 📌 Rotas restritas a gestores
router.post('/', roleMiddleware('gestor'), TeacherController.store);
router.put('/:id', roleMiddleware('gestor'), TeacherController.update);
router.delete('/:id', roleMiddleware('gestor'), TeacherController.delete);

// 📌 Rotas de listagem e consulta → todos autenticados
router.get('/', TeacherController.index);
router.get('/:id', TeacherController.show);

// 🔹 Submissões e notas → apenas professores ou gestores
router.get('/:teacherId/submissions/pending', roleMiddleware('professor', 'gestor'), (req, res, next) => {
  // Professores só podem acessar suas próprias submissões
  if (req.userRole === 'professor' && req.userId != req.params.teacherId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}, TeacherAdvancedController.pendingSubmissions);

router.get('/:teacherId/submissions/graded', roleMiddleware('professor', 'gestor'), (req, res, next) => {
  if (req.userRole === 'professor' && req.userId != req.params.teacherId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}, TeacherAdvancedController.gradedSubmissions);

router.get('/:teacherId/grades', roleMiddleware('professor', 'gestor'), (req, res, next) => {
  if (req.userRole === 'professor' && req.userId != req.params.teacherId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}, TeacherAdvancedController.gradesByTeacher);

export default router;
