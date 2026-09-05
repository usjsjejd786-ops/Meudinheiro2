const express = require('express');
const transactionsController = require('../controllers/transactionsController');
const autenticar = require('../middleware/auth');

const router = express.Router();

router.use(autenticar);

router.get('/', transactionsController.listar);
router.post('/', transactionsController.criar);
router.get('/:id', transactionsController.buscarPorId);
router.put('/:id', transactionsController.atualizar);
router.delete('/:id', transactionsController.excluir);

module.exports = router;
