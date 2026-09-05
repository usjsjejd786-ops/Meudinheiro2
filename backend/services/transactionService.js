// Regras de acesso ao banco de dados relacionadas a transações
const db = require('../database/database');

const transactionService = {
  // Lista as transações de um usuário, com filtros opcionais
  listar(userId, filtros = {}) {
    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (filtros.tipo) {
      sql += ' AND type = ?';
      params.push(filtros.tipo);
    }

    if (filtros.categoria) {
      sql += ' AND category = ?';
      params.push(filtros.categoria);
    }

    if (filtros.dataInicio) {
      sql += ' AND date >= ?';
      params.push(filtros.dataInicio);
    }

    if (filtros.dataFim) {
      sql += ' AND date <= ?';
      params.push(filtros.dataFim);
    }

    sql += ' ORDER BY date DESC, id DESC';

    return db.prepare(sql).all(...params);
  },

  buscarPorId(id, userId) {
    const stmt = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId);
  },

  criar(userId, { type, amount, category, description, date }) {
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, type, amount, category, description, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(userId, type, amount, category, description || null, date);
    return this.buscarPorId(info.lastInsertRowid, userId);
  },

  atualizar(id, userId, { type, amount, category, description, date }) {
    const stmt = db.prepare(`
      UPDATE transactions
      SET type = ?, amount = ?, category = ?, description = ?, date = ?
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(type, amount, category, description || null, date, id, userId);
    return this.buscarPorId(id, userId);
  },

  excluir(id, userId) {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
    const info = stmt.run(id, userId);
    return info.changes > 0;
  },

  // Resumo geral: saldo, total de entradas, total de gastos, gastos do mês atual
  resumo(userId) {
    const totais = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END), 0) AS totalEntradas,
        COALESCE(SUM(CASE WHEN type = 'gasto' THEN amount ELSE 0 END), 0) AS totalGastos
      FROM transactions
      WHERE user_id = ?
    `).get(userId);

    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesStr = inicioMes.toISOString().slice(0, 10);

    const gastosMes = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE user_id = ? AND type = 'gasto' AND date >= ?
    `).get(userId, inicioMesStr);

    const ultimasTransacoes = db.prepare(`
      SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 5
    `).all(userId);

    return {
      saldo: totais.totalEntradas - totais.totalGastos,
      totalEntradas: totais.totalEntradas,
      totalGastos: totais.totalGastos,
      gastosDoMes: gastosMes.total,
      ultimasTransacoes,
    };
  },

  // Totais agrupados por categoria (para o gráfico de pizza/barras de gastos)
  porCategoria(userId) {
    return db.prepare(`
      SELECT category AS categoria, type AS tipo, COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE user_id = ?
      GROUP BY category, type
      ORDER BY total DESC
    `).all(userId);
  },

  // Totais mensais de entradas x gastos dos últimos 6 meses
  porMes(userId) {
    return db.prepare(`
      SELECT
        strftime('%Y-%m', date) AS mes,
        COALESCE(SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END), 0) AS entradas,
        COALESCE(SUM(CASE WHEN type = 'gasto' THEN amount ELSE 0 END), 0) AS gastos
      FROM transactions
      WHERE user_id = ?
      GROUP BY mes
      ORDER BY mes DESC
      LIMIT 6
    `).all(userId).reverse();
  },
};

module.exports = transactionService;
