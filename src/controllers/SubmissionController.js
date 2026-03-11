import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import Student from '../models/Student.js';

class SubmissionController {
  /**
   * Criar submissão
   * POST /submissions
   */
  async store(req, res) {
    try {
      const {
        task_id,
        student_id,
        content,
        file_url,
      } = req.body;

      if (!task_id || !student_id) {
        return res.status(400).json({
          error: 'task_id e student_id são obrigatórios',
        });
      }

      const task = await Task.findByPk(task_id);
      if (!task) {
        return res.status(404).json({
          error: 'Tarefa não encontrada',
        });
      }

      const student = await Student.findByPk(student_id);
      if (!student) {
        return res.status(404).json({
          error: 'Aluno não encontrado',
        });
      }

      const submission = await Submission.create({
        task_id,
        student_id,
        content,
        file_url,
        status: 'submitted',
      });

      return res.status(201).json(submission);
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * Listar todas as submissões
   * GET /submissions
   */
  async index(req, res) {
    try {
      const submissions = await Submission.findAll({
        include: [
          {
            model: Task,
            as: 'task',
            attributes: ['id', 'title', 'deadline'],
          },
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'matricula', 'curso'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      return res.json(submissions);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar submissões',
        details: error.message,
      });
    }
  }

  /**
   * Buscar submissão por ID
   * GET /submissions/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const submission = await Submission.findByPk(id, {
        include: [
          {
            model: Task,
            as: 'task',
            attributes: ['id', 'title'],
          },
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'matricula'],
          },
        ],
      });

      if (!submission) {
        return res.status(404).json({
          error: 'Submissão não encontrada',
        });
      }

      return res.json(submission);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao buscar submissão',
        details: error.message,
      });
    }
  }

  /**
   * Atualizar submissão
   * (Correção pelo professor)
   * PUT /submissions/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { grade, feedback, status } = req.body;

      const submission = await Submission.findByPk(id);
      if (!submission) {
        return res.status(404).json({
          error: 'Submissão não encontrada',
        });
      }

      await submission.update({
        grade,
        feedback,
        status: status || 'graded',
      });

      return res.json(submission);
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * Remover submissão
   * DELETE /submissions/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const submission = await Submission.findByPk(id);
      if (!submission) {
        return res.status(404).json({
          error: 'Submissão não encontrada',
        });
      }

      await submission.destroy();

      return res.json({
        message: 'Submissão removida com sucesso',
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao remover submissão',
        details: error.message,
      });
    }
  }
}

export default new SubmissionController();
