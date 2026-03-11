import Grade from '../models/Grade.js';
import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

class GradeController {
  /**
   * Criar nota (somente professor)
   */
  async store(req, res) {
    try {
      const { submission_id, score, feedback } = req.body;

      // Buscar professor logado
      const teacher = await Teacher.findOne({
        where: { user_id: req.user.id }
      });

      if (!teacher && req.user.tipo !== 'gestor') {
        return res.status(403).json({
          error: 'Apenas professores ou gestores podem lançar notas'
        });
      }

      const submission = await Submission.findByPk(submission_id);

      if (!submission) {
        return res.status(404).json({
          error: 'Submissão não encontrada'
        });
      }

      const existingGrade = await Grade.findOne({
        where: { submission_id }
      });

      if (existingGrade) {
        return res.status(400).json({
          error: 'Esta submissão já possui nota'
        });
      }

      const grade = await Grade.create({
        submission_id,
        teacher_id: teacher ? teacher.id : null,
        score,
        feedback
      });

      return res.status(201).json(grade);

    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Listar notas
   * - Professor: vê todas
   * - Aluno: vê apenas as suas
   */
  async index(req, res) {
    try {
    // 👨‍💼 Gestor → vê tudo
      if (req.user.tipo === 'gestor') {
        const grades = await Grade.findAll({
          include: ['submission']
        });
        return res.json(grades);
      }

      // 👨‍🏫 Professor → apenas notas que lançou
      if (req.user.tipo === 'professor') {
        const teacher = await Teacher.findOne({
          where: { user_id: req.user.id }
        });

        const grades = await Grade.findAll({
          where: { teacher_id: teacher.id },
          include: ['submission']
        });

        return res.json(grades);
      }

      // 👨‍🎓 Aluno → apenas suas notas
      if (req.user.tipo === 'aluno') {
        const student = await Student.findOne({
          where: { user_id: req.user.id }
        });

        const grades = await Grade.findAll({
          include: [
            {
              model: Submission,
              as: 'submission',
              where: { student_id: student.id }
            }
          ]
        });

        return res.json(grades);
      }

    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Mostrar uma nota específica
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const grade = await Grade.findByPk(id, {
        include: [
          {
            model: Submission,
            as: 'submission',
            include: [
              { model: Task, as: 'task' },
              { model: Student, as: 'student' },
            ],
          },
        ],
      });

      if (!grade) {
        return res.status(404).json({
          error: 'Nota não encontrada',
        });
      }

      const teacher = await Teacher.findByPk(userId);
      const student = await Student.findByPk(userId);

      // Professor pode ver qualquer nota
      if (teacher) return res.json(grade);

      // Aluno só vê se for dele
      if (
        student &&
        grade.submission.student_id === student.id
      ) {
        return res.json(grade);
      }

      return res.status(403).json({
        error: 'Acesso negado',
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * Atualizar nota (somente professor)
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const grade = await Grade.findByPk(id);

      if (!grade) {
        return res.status(404).json({
          error: 'Nota não encontrada'
        });
      }

      // Gestor pode tudo
      if (req.user.tipo === 'gestor') {
        await grade.update(req.body);
        return res.json(grade);
      }

      // Professor só pode alterar a própria nota
      const teacher = await Teacher.findOne({
        where: { user_id: req.user.id }
      });

      if (!teacher || grade.teacher_id !== teacher.id) {
        return res.status(403).json({
          error: 'Você não pode alterar esta nota'
        });
      }

      await grade.update(req.body);

      return res.json(grade);

    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Apagar nota (somente professor)
   */
  async delete(req, res) {
    try {

      const { id } = req.params;

      const grade = await Grade.findByPk(id);

      if (!grade) {
        return res.status(404).json({
          error: 'Nota não encontrada'
        });
      }

      // Gestor pode tudo
      if (req.user.tipo === 'gestor') {
        await grade.update(req.body);
        return res.json(grade);
      }

      // Professor só pode alterar a própria nota
      const teacher = await Teacher.findOne({
        where: { user_id: req.user.id }
      });

      if (!teacher || grade.teacher_id !== teacher.id) {
        return res.status(403).json({
          error: 'Você não pode eliminar esta nota'
        });
      }


      await grade.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
}

export default new GradeController();
