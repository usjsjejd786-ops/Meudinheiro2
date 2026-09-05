// Regras de acesso ao banco de dados relacionadas a usuários
const db = require('../database/database');

const userService = {
  buscarPorEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  buscarPorId(id) {
    const stmt = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  },

  criar({ name, email, hashedPassword }) {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    );
    const info = stmt.run(name, email, hashedPassword);
    return this.buscarPorId(info.lastInsertRowid);
  },

  atualizarNome(id, name) {
    const stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
    stmt.run(name, id);
    return this.buscarPorId(id);
  },

  atualizarSenha(id, hashedPassword) {
    const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
    stmt.run(hashedPassword, id);
  },
};

module.exports = userService;
