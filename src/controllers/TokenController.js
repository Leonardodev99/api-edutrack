import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class TokenController {
  /**
   * Login
   * POST /tokens
   */
  async store(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          error: 'Email e senha são obrigatórios'
        });
      }

      // Verifica se usuário existe
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          error: 'Usuário não encontrado'
        });
      }

      // Verifica se está ativo
      if (!user.ativo) {
        return res.status(403).json({
          error: 'Usuário inativo. Contacte a administração.'
        });
      }

      // Verifica senha
      const passwordValid = await user.checkPassword(senha);

      if (!passwordValid) {
        return res.status(401).json({
          error: 'Senha inválida'
        });
      }

      // 🔐 Gerar Token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          tipo: user.tipo // 👈 Perfil do usuário dentro do token
        },
        process.env.TOKEN_SECRET,
        {
          expiresIn: process.env.TOKEN_EXPIRATION
        }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo
        }
      });

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao gerar token'
      });
    }
  }
}

export default new TokenController();
