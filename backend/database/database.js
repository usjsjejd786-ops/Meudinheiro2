// Conexão com o banco de dados SQLite e inicialização do esquema
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH
  ? path.resolve(__dirname, '..', process.env.DB_PATH)
  : path.resolve(__dirname, 'meudinheiro.db');

// Garante que a pasta do banco existe
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Ativa as chaves estrangeiras (desligadas por padrão no SQLite)
db.pragma('foreign_keys = ON');

// Executa o schema.sql para criar as tabelas caso não existam
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;
