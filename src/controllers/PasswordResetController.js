import crypto from 'crypto';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
import User from '../models/User.js';
import transporter from '../config/mail.js';

dotenv.config();

class PasswordResetController {

  /**
   * 📩 Solicitar redefinição de senha
   */
  async forgot(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // 🔐 gerar token
      const token = crypto.randomBytes(20).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

      user.password_reset_token = tokenHash;
      user.password_reset_expires = expires;

      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      try {
        await transporter.sendMail({
          from: `"Edutrack" <${process.env.SMTP_USERNAME}>`,
          to: user.email,
          subject: 'Redefinição de senha',
          html: `
            <p>Olá, ${user.name}</p>
            <p>Você solicitou redefinição de senha.</p>
            <p>O link expira em 15 minutos:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
          `
        });

        return res.json({
          message: 'Email enviado com sucesso'
        });

      } catch (err) {
        console.error('Erro email:', err);

        // ⚠️ apenas para DEV
        return res.json({
          message: 'Erro ao enviar email (modo dev)',
          token,
          expires
        });
      }

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Erro ao solicitar reset'
      });
    }
  }

  /**
   * 🔑 Redefinir senha
   */
  async reset(req, res) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          error: 'Token e nova senha são obrigatórios'
        });
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        where: {
          password_reset_token: tokenHash,
          password_reset_expires: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          error: 'Token inválido ou expirado'
        });
      }

      // 🔐 atualiza senha (hook vai gerar hash)
      user.password = password;

      // limpar token
      user.password_reset_token = null;
      user.password_reset_expires = null;

      await user.save();

      return res.json({
        message: 'Senha redefinida com sucesso'
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Erro ao redefinir senha'
      });
    }
  }
}

export default new PasswordResetController();
