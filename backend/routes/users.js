const express = require('express');
const usersController = require('../controllers/usersController');
const autenticar = require('../middleware/auth');

const router = express.Router();

router.use(autenticar);

router.get('/profile', usersController.perfil);
router.put('/profile', usersController.atualizarPerfil);
router.put('/password', usersController.atualizarSenha);

module.exports = router;
