// Middleware responsável por proteger rotas privadas usando JWT
const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [tipo, token] = authHeader.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Token de autenticação não informado.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Anexa o usuário autenticado na requisição para uso nas próximas etapas
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

module.exports = autenticar;
