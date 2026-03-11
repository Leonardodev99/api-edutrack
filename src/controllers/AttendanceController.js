import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Schedule from '../models/Schedule.js';
import Teacher from '../models/Teacher.js';

class AttendanceController {

  /**
   * 📌 Criar presença individual
   * POST /attendances
   */
  async store(req, res) {
    try {
      const {
        student_id,
        schedule_id,
        teacher_id,
        data_aula,
        presente,
        observacao
      } = req.body;

      const attendance = await Attendance.create({
        student_id,
        schedule_id,
        teacher_id,
        data_aula,
        presente,
        observacao
      });

      return res.status(201).json(attendance);

    } catch (error) {

      // 🔥 Tratamento de duplicação (constraint do banco)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: 'Presença já registrada para este aluno nesta aula e data'
        });
      }

      return res.status(400).json({
        error: error.message
      });
    }
  }

  /**
   * 📌 Criar presença em massa
   * POST /attendances/bulk
   */
  async bulkCreate(req, res) {
    try {
      const {
        schedule_id,
        teacher_id,
        data_aula,
        lista_presencas // array [{ student_id, presente, observacao }]
      } = req.body;

      const records = lista_presencas.map(item => ({
        student_id: item.student_id,
        schedule_id,
        teacher_id,
        data_aula,
        presente: item.presente,
        observacao: item.observacao || null
      }));

      await Attendance.bulkCreate(records);

      return res.status(201).json({
        message: 'Presenças registradas com sucesso'
      });

    } catch (error) {

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: 'Uma ou mais presenças já estavam registradas'
        });
      }

      return res.status(400).json({
        error: error.message
      });
    }
  }

  /**
   * 📌 Listar presenças
   * GET /attendances
   */
  async index(req, res) {
    try {
      const attendances = await Attendance.findAll({
        include: [
          {
            association: 'student',
            attributes: ['id', 'matricula']
          },
          {
            association: 'schedule',
            attributes: ['id', 'disciplina', 'dia_semana']
          },
          {
            association: 'teacher',
            attributes: ['id']
          }
        ],
        order: [['data_aula', 'DESC']]
      });

      return res.json(attendances);

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar presenças'
      });
    }
  }

  /**
   * 📌 Buscar presença por ID
   * GET /attendances/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const attendance = await Attendance.findByPk(id, {
        include: [
          { association: 'student' },
          { association: 'schedule' },
          { association: 'teacher' }
        ]
      });

      if (!attendance) {
        return res.status(404).json({
          error: 'Presença não encontrada'
        });
      }

      return res.json(attendance);

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao buscar presença'
      });
    }
  }

  /**
   * 📌 Atualizar presença
   * PUT /attendances/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const attendance = await Attendance.findByPk(id);

      if (!attendance) {
        return res.status(404).json({
          error: 'Presença não encontrada'
        });
      }

      await attendance.update(req.body);

      return res.json(attendance);

    } catch (error) {

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: 'Já existe presença registrada para essa combinação'
        });
      }

      return res.status(400).json({
        error: error.message
      });
    }
  }

  /**
   * 📌 Remover presença
   * DELETE /attendances/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const attendance = await Attendance.findByPk(id);

      if (!attendance) {
        return res.status(404).json({
          error: 'Presença não encontrada'
        });
      }

      await attendance.destroy();

      return res.json({
        message: 'Presença removida com sucesso'
      });

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao remover presença'
      });
    }
  }
}

export default new AttendanceController();
