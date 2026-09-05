const userService = require('../services/userService');
const transactionService = require('../services/transactionService');

const dashboardController = {
  resumo(req, res) {
    const usuario = userService.buscarPorId(req.userId);
    const resumo = transactionService.resumo(req.userId);
    return res.json({ usuario, ...resumo });
  },

  categorias(req, res) {
    const categorias = transactionService.porCategoria(req.userId);
    return res.json({ categorias });
  },

  mensal(req, res) {
    const meses = transactionService.porMes(req.userId);
    return res.json({ meses });
  },
};

module.exports = dashboardController;
