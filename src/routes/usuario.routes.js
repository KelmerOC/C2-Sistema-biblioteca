const express = require('express');
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/usuario.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Toda la gestión de usuarios es exclusiva del administrador
router.use(verificarToken, soloAdmin);

router.get('/', listar);
router.get('/:id', obtener);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;