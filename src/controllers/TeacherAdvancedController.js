import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import User from '../models/User.js';

class TeacherAdvancedController {

  // 🔹 Submissões SEM nota
  async pendingSubmissions(req, res) {
    try {
      const { teacherId } = req.params;

      const submissions = await Submission.findAll({
        include: [
          {
            model: Task,
            as: 'task',
            where: { teacher_id: teacherId },
            attributes: ['id', 'title']
          },
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'matricula'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'nome', 'email']
              }
            ]
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

      // REGRA DE NEGÓCIO
      if (submissions.length === 0) {
        return res.json({
          message: 'Não existem submissões pendentes para este professor',
          data: []
        });
      }

      return res.json({
        total: submissions.length,
        data: submissions
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar submissões pendentes',
        details: error.message
      });
    }
  }

  // 🔹 Submissões JÁ avaliadas
  async gradedSubmissions(req, res) {
    try {
      const { teacherId } = req.params;

      const submissions = await Submission.findAll({
        include: [
          {
            model: Task,
            as: 'task',
            where: { teacher_id: teacherId }
          },
          {
            model: Student,
            as: 'student'
          },
          {
            model: Grade,
            as: 'grade',
            required: true // 🔥 garante que só venha avaliadas
          }
        ]
      });

      if (submissions.length === 0) {
        return res.json({
          message: 'Não existem submissões avaliadas para este professor',
          data: []
        });
      }

      return res.json({
        total: submissions.length,
        data: submissions
      });

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar submissões avaliadas',
        details: error.message
      });
    }
  }

  // 🔹 Notas lançadas pelo professor
  async gradesByTeacher(req, res) {
    try {
      const { teacherId } = req.params;

      const grades = await Grade.findAll({
        where: { teacher_id: teacherId },
        include: [
          {
            model: Submission,
            as: 'submission',
            include: [
              {
                model: Student,
                as: 'student'
              },
              {
                model: Task,
                as: 'task',
                required: true
              }
            ]
          }
        ]
      });

      // ✅ REGRA DE NEGÓCIO
      if (grades.length === 0) {
        return res.json({
          message: 'Este professor ainda não lançou nenhuma nota',
          data: []
        });
      }

      return res.json({
        total: grades.length,
        data: grades
      });

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar notas do professor',
        details: error.message
      });
    }
  }
}

export default new TeacherAdvancedController();
