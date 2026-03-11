import Submission from '../models/Submission.js';
import Grade from '../models/Grade.js';
import Task from '../models/Task.js';
import Student from '../models/Student.js';

class SubmissionAdvancedController {

  // 🔹 Listar submissões pendentes por professor (query)
  async pending(req, res) {
    try {
      const { teacher_id } = req.query;

      const submissions = await Submission.findAll({
        include: [
          {
            model: Task,
            as: 'task',
            where: { teacher_id }
          },
          {
            model: Student,
            as: 'student'
          },
          {
            model: Grade,
            as: 'grade',
            required: false
          }
        ],
        where: {
          '$grade.id$': null
        }
      });

      if (submissions.length === 0) {
        return res.json({
          message: 'Nenhuma submissão pendente encontrada',
          data: []
        });
      }

      return res.json(submissions);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar submissões pendentes',
        details: error.message
      });
    }
  }
}

export default new SubmissionAdvancedController();
