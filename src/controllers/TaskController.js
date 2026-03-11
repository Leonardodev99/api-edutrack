import Task from '../models/Task.js';
import Teacher from '../models/Teacher.js';

class TaskController {
  // CREATE
  async store(req, res) {
    try {
      const {
        title,
        description,
        deadline,
        teacher_id,
      } = req.body;

      if (!title || !deadline || !teacher_id) {
        return res.status(400).json({
          error: 'Título, deadline e teacher_id são obrigatórios',
        });
      }

      const teacher = await Teacher.findByPk(teacher_id);
      if (!teacher) {
        return res.status(404).json({
          error: 'Professor não encontrado',
        });
      }

      const task = await Task.create({
        title,
        description,
        deadline,
        teacher_id,
      });

      return res.status(201).json(task);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao criar tarefa',
        details: error.message,
      });
    }
  }
  // LISTAR TODAS
  async index(req, res) {
    try {
      const tasks = await Task.findAll({
        include: [
          {
            model: Teacher,
            as: 'teacher',
            attributes: ['id', 'disciplina', 'departamento'],
          },
        ],
        order: [['deadline', 'ASC']],
      });

      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar tarefas',
        details: error.message,
      });
    }
  }


  // MOSTRAR UMA
  async show(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findByPk(id, {
        include: [
          {
            model: Teacher,
            as: 'teacher',
            attributes: ['id', 'disciplina', 'departamento'],
          },
        ],
      });

      if (!task) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      return res.json(task);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao buscar tarefa',
        details: error.message,
      });
    }
  }


  // UPDATE
  async update(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      const { title, description, deadline, teacher_id } = req.body;

      if (teacher_id) {
        const teacher = await Teacher.findByPk(teacher_id);
        if (!teacher) {
          return res.status(404).json({ error: 'Professor não encontrado' });
        }
      }

      await task.update({
        title,
        description,
        deadline,
        teacher_id,
      });

      return res.json(task);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao atualizar tarefa',
        details: error.message,
      });
    }
  }


  // DELETE
  async delete(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      await task.destroy();

      return res.json({ message: 'Tarefa removida com sucesso' });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao remover tarefa',
        details: error.message,
      });
    }
  }
}

export default new TaskController();
