import User from '../models/User';
import Teacher from '../models/Teacher';

class TeacherController {
  /**
   * Criar professor
   * POST /teachers
   */
  async store(req, res) {
    try {
      const { user_id, departamento, disciplina } = req.body;

      // Verifica se o usuário existe e é do tipo professor
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      if (user.tipo !== 'professor') {
        return res.status(400).json({ error: 'Só é possível criar Teacher para usuários do tipo professor' });
      }

      const teacher = await Teacher.create({
        user_id,
        departamento,
        disciplina
      });

      return res.status(201).json(teacher);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Listar todos os professores
   * GET /teachers
   */
  async index(req, res) {
    try {
      const teachers = await Teacher.findAll({
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'nome', 'email']
        }
      });

      return res.json(teachers);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar professores' });
    }
  }

  /**
   * Buscar professor por ID
   * GET /teachers/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const teacher = await Teacher.findByPk(id, {
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'nome', 'email']
        }
      });

      if (!teacher) {
        return res.status(404).json({ error: 'Professor não encontrado' });
      }

      return res.json(teacher);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar professor' });
    }
  }

  /**
   * Atualizar professor
   * PUT /teachers/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { departamento, disciplina, ativo } = req.body;

      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        return res.status(404).json({ error: 'Professor não encontrado' });
      }

      await teacher.update({ departamento, disciplina, ativo });

      return res.json(teacher);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remover professor
   * DELETE /teachers/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        return res.status(404).json({ error: 'Professor não encontrado' });
      }

      await teacher.destroy();

      return res.json({ message: 'Professor removido com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover professor' });
    }
  }
}

export default new TeacherController();
