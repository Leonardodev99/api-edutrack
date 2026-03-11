import dotenv from 'dotenv';
import { resolve } from 'path';



dotenv.config();

import './src/database';

import express from 'express';

import homeRoutes from './src/routes/homeRoutes';
import userRoutes from './src/routes/userRoutes';
import studentRoutes from './src/routes/studentRoutes';
import teacherRoutes from './src/routes/teacherRoutes';
import materialRoutes from './src/routes/materialRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import submissionsRoutes from './src/routes/submissionsRoutes.js';
import gradeRoutes from './src/routes/gradeRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import guardianRoutes from './src/routes/guardianRoutes.js';
import classRoutes from './src/routes/classRoutes.js';
import scheduleRoutes from './src/routes/scheduleRoutes.js';
import attendanceRoutes from './src/routes/attendanceRoutes.js';
import tokenRoutes from './src/routes/tokenRoutes.js';




class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(express.static(resolve(__dirname, 'uploads')));
  }

  routes() {
    this.app.use('/', homeRoutes);
    this.app.use('/users', userRoutes);
    this.app.use('/students', studentRoutes);
    this.app.use('/teachers', teacherRoutes);
    this.app.use('/materials', materialRoutes);
    this.app.use('/tasks', taskRoutes);
    this.app.use('/submissions', submissionsRoutes);
    this.app.use('/grades', gradeRoutes);
    this.app.use('/messages', messageRoutes);
    this.app.use('/guardians', guardianRoutes);
    this.app.use('/classes', classRoutes);
    this.app.use('/schedules', scheduleRoutes);
    this.app.use('/attendances', attendanceRoutes);
    this.app.use('/tokens', tokenRoutes);

  }
}

export default new App().app;
