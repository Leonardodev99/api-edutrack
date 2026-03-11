import { Sequelize } from 'sequelize';
import databaseConfig from '../config/database';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Material from '../models/Material.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import Grade from '../models/Grade.js';
import Message from '../models/Message.js';
import Guardian from '../models/Guardian.js';
import Class from '../models/Class.js';
import Schedule from '../models/Schedule.js';
import Attendance from '../models/Attendance.js';

const models = [User, Student, Teacher, Material, Task, Submission, Grade, Message, Guardian, Class, Schedule, Attendance];

const connection = new Sequelize(databaseConfig);

// Inicializa todos os models
models.forEach((model) => model.init(connection));

// Cria associações
models.forEach((model) => {
  if (model.associate) {
    model.associate({ User, Student, Teacher, Material, Task, Submission, Grade, Message, Guardian, Class, Schedule, Attendance });
  }
});

export { connection, User, Student, Teacher, Material, Task, Submission, Grade, Message, Guardian, Class, Schedule, Attendance };
