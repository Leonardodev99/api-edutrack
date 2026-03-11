export default function roleMiddleware(...tiposPermitidos) {
  return (req, res, next) => {
    if (!tiposPermitidos.includes(req.userTipo)) {
      return res.status(403).json({
        error: 'Acesso negado: perfil sem permissão'
      });
    }

    return next();
  };
}
