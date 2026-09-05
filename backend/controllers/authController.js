const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const authController = {
  registrar(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ erro: 'Informe um e-mail válido.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const existente = userService.buscarPorEmail(email.toLowerCase().trim());
    if (existente) {
      return res.status(409).json({ erro: 'Já existe uma conta cadastrada com este e-mail.' });
    }

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
    const usuario = userService.criar({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      hashedPassword,
    });

    const token = gerarToken(usuario);
    return res.status(201).json({ usuario, token });
  },

  login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    const usuario = userService.buscarPorEmail(email.toLowerCase().trim());
    if (!usuario) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const senhaValida = bcrypt.compareSync(password, usuario.password);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const token = gerarToken(usuario);
    const { password: _senha, ...usuarioSemSenha } = usuario;
    return res.json({ usuario: usuarioSemSenha, token });
  },

  logout(req, res) {
    // Como a autenticação é via JWT (stateless), o "logout" é feito no
    // cliente descartando o token. O endpoint existe para o frontend
    // ter um fluxo explícito e para futura extensão (ex.: blacklist).
    return res.json({ mensagem: 'Logout realizado com sucesso.' });
  },

  me(req, res) {
    const usuario = userService.buscarPorId(req.userId);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    return res.json({ usuario });
  },
};

module.exports = authController;
