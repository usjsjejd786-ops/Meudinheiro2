// Middleware central de tratamento de erros
function errorHandler(err, req, res, next) {
  console.error('[ERRO]', err);

  if (err.status) {
    return res.status(err.status).json({ erro: err.message });
  }

  return res.status(500).json({ erro: 'Erro interno do servidor. Tente novamente mais tarde.' });
}

module.exports = errorHandler;
