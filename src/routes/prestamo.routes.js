const express = require('express');
const { solicitar, aprobar, devolver, listar, obtener } = require('../controllers/prestamo.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Listado y consulta de préstamos
router.get('/', verificarToken, listar);
router.get('/:id', verificarToken, obtener);

// Solicitud de préstamo (cualquier usuario autenticado)
router.post('/', verificarToken, solicitar);

// Aprobación y devolución de préstamos (solo administradores)
router.put('/:id/aprobar', verificarToken, soloAdmin, aprobar);
router.put('/:id/devolver', verificarToken, soloAdmin, devolver);

module.exports = router;
