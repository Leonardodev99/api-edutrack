import Material from '../models/Material.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';

class MaterialController {
  /**
   * Criar material
   * POST /materials
   */
  // 📌 Criar material → professor
  async store(req, res) {
    try {
      const { teacher_id, title, description, file_url } = req.body;
      const userId = req.userId;

      // 🔒 Só professor logado pode criar para si mesmo
      if (teacher_id !== userId) {
        return res.status(403).json({ error: 'Você só pode criar materiais para si mesmo' });
      }

      const teacher = await Teacher.findByPk(teacher_id, {
        include: { model: User, as: 'user', attributes: ['id', 'nome', 'email'] },
      });

      if (!teacher) {
        return res.status(404).json({ error: 'Professor não encontrado' });
      }

      const material = await Material.create({ teacher_id, title, description, file_url });

      return res.status(201).json(material);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // 📌 Listar materiais → acesso por perfil
  async index(req, res) {
    try {
      const userId = req.userId;
      const user = await User.findByPk(userId);

      if (!user) return res.status(403).json({ error: 'Usuário não autorizado' });

      let materials;

      if (user.tipo === 'gestor') {
        // Gestor vê todos
        materials = await Material.findAll({
          include: { model: Teacher, as: 'teacher', include: { model: User, as: 'user', attributes: ['id', 'nome'] } },
        });
      } else if (user.tipo === 'professor') {
        // Professor vê só os seus
        const teacher = await Teacher.findOne({ where: { user_id: userId } });
        materials = await Material.findAll({
          where: { teacher_id: teacher.id },
          include: { model: Teacher, as: 'teacher', include: { model: User, as: 'user', attributes: ['id', 'nome'] } },
        });
      } else if (user.tipo === 'aluno') {
        // Aluno vê materiais das turmas que frequenta
        const student = await Student.findOne({ where: { user_id: userId } });
        const classes = await Class.findAll({ where: { id: student.class_id }, include: [{ model: Teacher, as: 'teacher' }] });

        const teacherIds = classes.map(c => c.teacher_id);

        materials = await Material.findAll({
          where: { teacher_id: teacherIds },
          include: { model: Teacher, as: 'teacher', include: { model: User, as: 'user', attributes: ['id', 'nome'] } },
        });
      } else {
        return res.status(403).json({ error: 'Usuário não autorizado' });
      }

      return res.json(materials);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 📌 Buscar material por ID → verifica acesso
  async show(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const user = await User.findByPk(userId);

      if (!user) return res.status(403).json({ error: 'Usuário não autorizado' });

      const material = await Material.findByPk(id, {
        include: { model: Teacher, as: 'teacher', include: { model: User, as: 'user', attributes: ['id', 'nome'] } },
      });

      if (!material) return res.status(404).json({ error: 'Material não encontrado' });

      // Verifica acesso
      if (user.tipo === 'gestor') return res.json(material);

      if (user.tipo === 'professor' && material.teacher.user_id === userId) return res.json(material);

      if (user.tipo === 'aluno') {
        const student = await Student.findOne({ where: { user_id: userId } });
        const classAluno = await Class.findByPk(student.class_id);
        if (classAluno && classAluno.teacher_id === material.teacher_id) return res.json(material);
      }

      return res.status(403).json({ error: 'Acesso negado' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar material
   * PUT /materials/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, file_url, ativo } = req.body;
      const userId = req.userId;

      const material = await Material.findByPk(id, {
        include: {
          model: Teacher,
          as: 'teacher',
        },
      });

      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      // 🔒 Verifica se o material pertence ao professor logado
      if (material.teacher.user_id !== userId) {
        return res.status(403).json({ error: 'Você só pode atualizar seus próprios materiais' });
      }

      await material.update({ title, description, file_url, ativo });

      return res.json(material);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const material = await Material.findByPk(id, {
        include: {
          model: Teacher,
          as: 'teacher',
        },
      });

      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      // 🔒 Só o professor dono pode deletar
      if (material.teacher.user_id !== userId) {
        return res.status(403).json({ error: 'Você só pode remover seus próprios materiais' });
      }

      await material.destroy();

      return res.json({ message: 'Material removido com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new MaterialController();
