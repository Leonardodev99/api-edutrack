import Student from '../models/Student';
import User from '../models/User.js';


class StudentController {
  /**
   * Criar aluno
   * POST /students
   */
  async store(req, res) {
    try {
      const { user_id, matricula, curso, ano_ingresso } = req.body;

      // Verifica se o usuário existe e é do tipo aluno
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      if (user.tipo !== 'aluno') {
        return res.status(400).json({ error: 'Só é possível criar Student para usuários do tipo aluno' });
      }

      // Verifica matrícula duplicada
      const matriculaExists = await Student.findOne({ where: { matricula } });
      if (matriculaExists) {
        return res.status(400).json({ error: 'Matrícula já existe' });
      }

      const student = await Student.create({
        user_id,
        matricula,
        curso,
        ano_ingresso
      });

      return res.status(201).json(student);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Listar todos os alunos
   * GET /students
   */
  async index(req, res) {
    try {
      const students = await Student.findAll({
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'nome', 'email']
        }
      });

      return res.json(students);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar alunos' });
    }
  }

  /**
   * Buscar aluno por ID
   * GET /students/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id, {
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'nome', 'email']
        }
      });

      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      return res.json(student);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar aluno' });
    }
  }

  /**
   * Atualizar aluno
   * PUT /students/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { matricula, curso, ano_ingresso, ativo } = req.body;

      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      // Verifica se a matrícula é única
      if (matricula && matricula !== student.matricula) {
        const matriculaExists = await Student.findOne({ where: { matricula } });
        if (matriculaExists) {
          return res.status(400).json({ error: 'Matrícula já existe' });
        }
      }

      await student.update({ matricula, curso, ano_ingresso, ativo });

      return res.json(student);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async uploadPhoto(req, res) {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Arquivo não enviado' });
      }

      await student.update({
        foto: req.file.filename
      });

      /* return res.json({
        message: 'Upload realizado com sucesso',
        file: req.file
      });*/
      return res.json({
        message: 'Upload realizado com sucesso',
        url: `${process.env.APP_URL}/images/${req.file.filename}`
      });

    } catch (error) {
      return res.status(400).json({
        error: error.message
      });
    }
  }

  /**
   * Remover aluno
   * DELETE /students/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      await student.destroy();

      return res.json({ message: 'Aluno removido com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover aluno' });
    }
  }
}

export default new StudentController();
