import Guardian from '../models/Guardian';
import User from '../models/User';
import Student from '../models/Student';
import sequelize from '../database'; // sua conexão

class GuardianController {
  // 📌 Listar todos
  async index(req, res) {
    try {
      const guardians = await Guardian.findAll({
        where: { ativo: true },
        attributes: ['id', 'telefone', 'ativo', 'created_at'],
        include: [
          {
            model: Student,
            as: 'students',
            attributes: ['id', 'matricula'],
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

      return res.json(guardians);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 📌 Buscar por ID
  async show(req, res) {
    try {
      const { id } = req.params;

      const guardian = await Guardian.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nome', 'email', 'tipo']
          },
          {
            model: Student,
            as: 'students',
            attributes: ['id', 'matricula'],
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

      if (!guardian) {
        return res.status(404).json({ error: 'Encarregado não encontrado' });
      }

      // 🔐 Se for encarregado, só pode ver o próprio perfil
      if (req.user.tipo === 'encarregado') {
        if (guardian.user_id !== req.user.id) {
          return res.status(403).json({
            error: 'Você só pode visualizar o seu próprio perfil'
          });
        }
      }

      return res.json(guardian);

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 📌 Criar
  // 📌 Criar Guardian e associar estudantes
  async store(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { nome, email, senha, telefone, students } = req.body;

      // 1️⃣ Criar usuário já como encarregado
      const user = await User.create(
        {
          nome,
          email,
          senha,
          tipo: 'encarregado'
        },
        { transaction }
      );

      // 2️⃣ Criar guardian vinculado ao user
      const guardian = await Guardian.create(
        {
          user_id: user.id,
          telefone
        },
        { transaction }
      );

      // 3️⃣ Associar alunos
      if (students && students.length > 0) {
        await guardian.setStudents(students, { transaction });
      }

      await transaction.commit();

      const guardianCreated = await Guardian.findByPk(guardian.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nome', 'email', 'tipo']
          },
          {
            model: Student,
            as: 'students',
            attributes: ['id', 'matricula']
          }
        ]
      });

      return res.status(201).json(guardianCreated);

    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.message });
    }
  }

  // 📌 Atualizar
  // 📌 Atualizar Guardian e estudantes associados
  async update(req, res) {
    try {
      const { id } = req.params;
      const { telefone, ativo, students } = req.body;

      const guardian = await Guardian.findByPk(id);

      if (!guardian) {
        return res.status(404).json({ error: 'Encarregado não encontrado' });
      }

      // 🔐 Se for encarregado, só pode atualizar o próprio perfil
      if (req.user.tipo === 'encarregado') {
        if (guardian.user_id !== req.user.id) {
          return res.status(403).json({
            error: 'Você só pode atualizar o seu próprio perfil'
          });
        }
      }

      await guardian.update({ telefone, ativo });

      if (students && req.user.tipo === 'gestor') {
        await guardian.setStudents(students);
      }

      const guardianWithStudents = await Guardian.findByPk(guardian.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'nome', 'email', 'tipo'] },
          {
            model: Student,
            as: 'students',
            attributes: ['id', 'matricula'],
            include: [
              { model: User, as: 'user', attributes: ['id', 'nome', 'email'] }
            ]
          }
        ]
      });

      return res.json(guardianWithStudents);

    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // 📌 Soft Delete
  async delete(req, res) {
    try {
      const { id } = req.params;

      const guardian = await Guardian.findByPk(id);

      if (!guardian) {
        return res.status(404).json({ error: 'Encarregado não encontrado' });
      }

      await guardian.update({ ativo: false });

      return res.json({ message: 'Encarregado desativado com sucesso' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new GuardianController();
