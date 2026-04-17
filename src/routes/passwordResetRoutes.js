import { Router } from 'express';
import PasswordResetController from '../controllers/PasswordResetController';

const routes = new Router();

// Solicitar token de redefinição
routes.post('/forgot', PasswordResetController.forgot);

// Redefinir senha
routes.post('/reset', PasswordResetController.reset);

export default routes;
