const bcrypt = require('bcrypt');
const userService = require('../services/userService');

const SALT_ROUNDS = 10;

const usersController = {
  perfil(req, res) {
    const usuario = userService.buscarPorId(req.userId);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    return res.json({ usuario });
  },

  atualizarPerfil(req, res) {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ erro: 'O nome não pode ficar em branco.' });
    }

    const usuario = userService.atualizarNome(req.userId, name.trim());
    return res.json({ usuario });
  },

  atualizarSenha(req, res) {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ erro: 'Informe a senha atual e a nova senha.' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const usuarioCompleto = require('../database/database')
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(req.userId);

    const senhaValida = bcrypt.compareSync(senhaAtual, usuarioCompleto.password);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'A senha atual informada está incorreta.' });
    }

    const hashedPassword = bcrypt.hashSync(novaSenha, SALT_ROUNDS);
    userService.atualizarSenha(req.userId, hashedPassword);

    return res.json({ mensagem: 'Senha atualizada com sucesso.' });
  },
};

module.exports = usersController;
