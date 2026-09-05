const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const autenticar = require('../middleware/auth');

const router = express.Router();

router.use(autenticar);

router.get('/summary', dashboardController.resumo);
router.get('/categories', dashboardController.categorias);
router.get('/monthly', dashboardController.mensal);

module.exports = router;
