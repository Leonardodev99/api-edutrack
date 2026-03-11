import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

class ClassController {

  /**
   * 📌 Criar Turma
   * POST /classes
   */
  async store(req, res) {
    try {
      const { nome, ano_letivo, curso, teacher_id } = req.body;

      const newClass = await Class.create({
        nome,
        ano_letivo,
        curso,
        teacher_id
      });

      const classWithRelations = await Class.findByPk(newClass.id, {
        include: [
          {
            model: Teacher,
            as: 'teacher',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ]
      });

      return res.status(201).json(classWithRelations);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * 📌 Listar Turmas
   * GET /classes
   */
  async index(req, res) {
    try {
      let whereCondition = { ativo: true };

      // 🔐 Se for professor, filtrar pelas suas turmas
      if (req.user.tipo === 'professor') {
        const teacher = await Teacher.findOne({
          where: { user_id: req.user.id }
        });

        if (!teacher) {
          return res.status(404).json({
            error: 'Professor não encontrado'
          });
        }

        whereCondition.teacher_id = teacher.id;
      }

      const classes = await Class.findAll({
        where: whereCondition,
        include: [
          {
            model: Teacher,
            as: 'teacher',
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

      return res.json(classes);

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar turmas'
      });
    }
  }

  /**
   * 📌 Buscar Turma por ID
   * GET /classes/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const turma = await Class.findByPk(id, {
        include: [
          {
            association: 'teacher',
            include: [
              {
                association: 'user',
                attributes: ['id', 'nome', 'email']
              }
            ]
          },
          {
            association: 'students',
            attributes: ['id', 'matricula'],
            include: [
              {
                association: 'user',
                attributes: ['id', 'nome']
              }
            ]
          }
        ]
      });

      if (!turma) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      // 🔐 Se for professor, só pode ver sua própria turma
      if (req.user.tipo === 'professor') {
        if (turma.teacher.user_id !== req.user.id) {
          return res.status(403).json({
            error: 'Acesso negado. Esta turma não pertence a você.'
          });
        }
      }

      return res.json(turma);

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar turma' });
    }
  }
  /**
   * 📌 Atualizar Turma
   * PUT /classes/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, ano_letivo, curso, teacher_id, ativo } = req.body;

      const turma = await Class.findByPk(id);

      if (!turma) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      await turma.update({
        nome,
        ano_letivo,
        curso,
        teacher_id,
        ativo
      });

      return res.json(turma);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
 * 📌 Matricular aluno na turma
 * POST /classes/:classId/enroll
 */
  async enrollStudent(req, res) {
    try {
      const { classId } = req.params;
      const { student_id } = req.body;

      // Verifica se turma existe
      const turma = await Class.findByPk(classId);
      if (!turma) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      // Verifica se aluno existe
      const student = await Student.findByPk(student_id);
      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      // Verifica se já está matriculado
      if (student.class_id === turma.id) {
        return res.status(400).json({
          error: 'Aluno já está matriculado nesta turma'
        });
      }

      // Se já estiver em outra turma
      if (student.class_id && student.class_id !== turma.id) {
        return res.status(400).json({
          error: 'Aluno já está matriculado em outra turma'
        });
      }

      await student.update({ class_id: turma.id });

      return res.json({
        message: 'Aluno matriculado com sucesso',
        student
      });

    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  /*/**
 * 📌 Matricular aluno na turma
 * POST /classes/:classId/enroll

async enrollStudent(req, res) {
  try {
    const { classId } = req.params;
    const { student_id } = req.body;

    // 🔎 Verifica se turma existe
    const turmaDestino = await Class.findByPk(classId);
    if (!turmaDestino) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    if (!turmaDestino.ativo) {
      return res.status(400).json({
        error: 'Não é possível matricular aluno em turma inativa'
      });
    }

    // 🔎 Verifica se aluno existe
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // 🔒 Se aluno já está vinculado a uma turma
    if (student.class_id) {
      const turmaAtual = await Class.findByPk(student.class_id);

      // 🚨 Se turma atual está ativa → bloquear
      if (turmaAtual && turmaAtual.ativo) {
        return res.status(400).json({
          error: 'Aluno já está matriculado em uma turma ativa'
        });
      }
    }

    // ✅ Matricular
    await student.update({ class_id: turmaDestino.id });

    return res.json({
      message: 'Aluno matriculado com sucesso',
      student
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
} */

  /**
   * 📌 Desativar Turma (Soft Delete)
   * DELETE /classes/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const turma = await Class.findByPk(id);

      if (!turma) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      await turma.update({ ativo: false });

      return res.json({ message: 'Turma desativada com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao desativar turma' });
    }
  }
}

export default new ClassController();
