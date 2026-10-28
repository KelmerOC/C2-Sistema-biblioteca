const express = require('express');
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/libro.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Rutas públicas para usuarios autenticados (cualquier rol)
router.get('/', verificarToken, listar);
router.get('/:id', verificarToken, obtener);

// Rutas exclusivas del administrador
router.post('/', verificarToken, soloAdmin, crear);
router.put('/:id', verificarToken, soloAdmin, actualizar);
router.delete('/:id', verificarToken, soloAdmin, eliminar);

module.exports = router;
