import Grade from '../models/Grade.js';
import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import Teacher from '../models/Teacher.js';
import { Sequelize } from 'sequelize';
import User from '../models/User.js';


class StudentAdvancedController {

  // 🔹 Notas do aluno
  async grades(req, res) {
    try {
      const { studentId } = req.params;

      const grades = await Grade.findAll({
        include: [
          {
            model: Submission,
            as: 'submission',
            where: { student_id: studentId },
            include: [
              {
                model: Task,
                as: 'task'
              }
            ]
          },
          {
            model: Teacher,
            as: 'teacher',
            attributes: ['id', 'disciplina'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'nome']
              }
            ]
          }
        ]
      });

      // REGRA DE NEGÓCIO
      if (grades.length === 0) {
        return res.json({
          message: 'Nenhuma nota disponível para este aluno',
          data: []
        });
      }

      return res.json({
        total: grades.length,
        data: grades
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao consultar notas',
        details: error.message
      });
    }
  }

  // 🔹 Boletim (média por disciplina)
  async report(req, res) {
    try {
      const { studentId } = req.params;

      const report = await Grade.findAll({
        attributes: [
          [Sequelize.col('submission.task.title'), 'subject'],
          [Sequelize.fn('AVG', Sequelize.col('score')), 'average']
        ],
        include: [
          {
            model: Submission,
            as: 'submission',
            where: { student_id: studentId },
            attributes: [],
            include: [
              {
                model: Task,
                as: 'task',
                attributes: []
              }
            ]
          }
        ],
        group: ['submission.task.title']
      });
      // REGRA DE NEGÓCIO
      if (report.length === 0) {
        return res.json({
          message: 'Nenhuma nota disponível para este aluno',
          data: []
        });
      }

      return res.json(report);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao gerar boletim',
        details: error.message
      });
    }
  }

  // 🔹 Submissões do aluno
  async submissions(req, res) {
    try {
      const { studentId } = req.params;

      const submissions = await Submission.findAll({
        where: { student_id: studentId },
        include: [
          {
            model: Task,
            as: 'task'
          },
          {
            model: Grade,
            as: 'grade',
            required: false
          }
        ]
      });

      if (submissions.length === 0) {
        return res.json({
          message: 'Nenhuma submissão encontrada para este aluno',
          data: []
        });
      }

      return res.json({
        total: submissions.length,
        data: submissions
      });

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar submissões',
        details: error.message
      });
    }
  }


}

export default new StudentAdvancedController();
