const express = require('express');
const authController = require('../controllers/authController');
const autenticar = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.registrar);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', autenticar, authController.me);

module.exports = router;
