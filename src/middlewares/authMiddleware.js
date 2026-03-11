import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({
        error: 'Token não enviado'
      });
    }

    const [, token] = authorization.split(' ');

    try {
      const dados = jwt.verify(token, process.env.TOKEN_SECRET);

      const { id, email, tipo } = dados;

      const user = await User.findByPk(id);

      if (!user || !user.ativo) {
        return res.status(401).json({
          error: 'Usuário inválido ou inativo'
        });
      }

      // 🔐 Dados disponíveis na requisição
      req.userId = id;
      req.userEmail = email;
      req.userTipo = tipo;

      return next();

    } catch (err) {
      return res.status(401).json({
        error: 'Token inválido ou expirado'
      });
    }

  } catch (error) {
    return res.status(401).json({
      error: 'Erro na autenticação'
    });
  }
};
