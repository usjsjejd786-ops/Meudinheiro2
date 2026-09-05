const transactionService = require('../services/transactionService');

const TIPOS_VALIDOS = ['entrada', 'gasto'];

function validarTransacao(body) {
  const { type, amount, category, date } = body;

  if (!type || !TIPOS_VALIDOS.includes(type)) {
    return 'O tipo deve ser "entrada" ou "gasto".';
  }

  const valorNumerico = Number(amount);
  if (!amount || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
    return 'Informe um valor numérico maior que zero.';
  }

  if (!category || !category.trim()) {
    return 'A categoria é obrigatória.';
  }

  if (!date || Number.isNaN(Date.parse(date))) {
    return 'Informe uma data válida.';
  }

  return null;
}

const transactionsController = {
  listar(req, res) {
    const { tipo, categoria, dataInicio, dataFim } = req.query;
    const transacoes = transactionService.listar(req.userId, {
      tipo,
      categoria,
      dataInicio,
      dataFim,
    });
    return res.json({ transacoes });
  },

  buscarPorId(req, res) {
    const transacao = transactionService.buscarPorId(req.params.id, req.userId);
    if (!transacao) {
      return res.status(404).json({ erro: 'Transação não encontrada.' });
    }
    return res.json({ transacao });
  },

  criar(req, res) {
    const erro = validarTransacao(req.body);
    if (erro) {
      return res.status(400).json({ erro });
    }

    const transacao = transactionService.criar(req.userId, {
      type: req.body.type,
      amount: Number(req.body.amount),
      category: req.body.category.trim(),
      description: req.body.description ? req.body.description.trim() : null,
      date: req.body.date,
    });

    return res.status(201).json({ transacao });
  },

  atualizar(req, res) {
    const existente = transactionService.buscarPorId(req.params.id, req.userId);
    if (!existente) {
      return res.status(404).json({ erro: 'Transação não encontrada.' });
    }

    const erro = validarTransacao(req.body);
    if (erro) {
      return res.status(400).json({ erro });
    }

    const transacao = transactionService.atualizar(req.params.id, req.userId, {
      type: req.body.type,
      amount: Number(req.body.amount),
      category: req.body.category.trim(),
      description: req.body.description ? req.body.description.trim() : null,
      date: req.body.date,
    });

    return res.json({ transacao });
  },

  excluir(req, res) {
    const existente = transactionService.buscarPorId(req.params.id, req.userId);
    if (!existente) {
      return res.status(404).json({ erro: 'Transação não encontrada.' });
    }

    transactionService.excluir(req.params.id, req.userId);
    return res.json({ mensagem: 'Transação excluída com sucesso.' });
  },
};

module.exports = transactionsController;
