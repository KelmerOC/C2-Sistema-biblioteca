const { Op } = require('sequelize');
const { Libro, Prestamo } = require('../models');

// GET /libros  (?titulo=)
async function listar(req, res) {
    try {
        const where = {};
        if (req.query.titulo) {
            where.titulo = { [Op.like]: `%${req.query.titulo}%` };
        }
        const libros = await Libro.findAll({ where });
        res.json(libros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los libros' });
    }
}

// GET /libros/:id
async function obtener(req, res) {
    try {
        const libro = await Libro.findByPk(req.params.id);
        if (!libro) {
            return res.status(404).json({ mensaje: 'Libro no encontrado' });
        }
        res.json(libro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el libro' });
    }
}

// --- Helper: valida los campos del body ---
function validarCampos(body) {
    const { titulo, autor, categoria, cantidad } = body;
    if (!titulo || !autor || !categoria || cantidad === undefined) {
        return 'Los campos titulo, autor, categoria y cantidad son obligatorios';
    }
    if (!Number.isInteger(Number(cantidad)) || Number(cantidad) < 0) {
        return 'El campo cantidad debe ser un entero mayor o igual a 0';
    }
    return null;
}

// POST /libros
async function crear(req, res) {
    try {
        const error = validarCampos(req.body);
        if (error) return res.status(400).json({ mensaje: error });

        const { titulo, autor, categoria, cantidad } = req.body;
        const libro = await Libro.create({ titulo, autor, categoria, cantidad: Number(cantidad) });
        res.status(201).json(libro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear el libro' });
    }
}

// PUT /libros/:id
async function actualizar(req, res) {
    try {
        const libro = await Libro.findByPk(req.params.id);
        if (!libro) return res.status(404).json({ mensaje: 'Libro no encontrado' });

        const error = validarCampos(req.body);
        if (error) return res.status(400).json({ mensaje: error });

        const { titulo, autor, categoria, cantidad } = req.body;
        await libro.update({ titulo, autor, categoria, cantidad: Number(cantidad) });
        res.json(libro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el libro' });
    }
}

// DELETE /libros/:id
async function eliminar(req, res) {
    try {
        const libro = await Libro.findByPk(req.params.id);
        if (!libro) return res.status(404).json({ mensaje: 'Libro no encontrado' });

        await libro.destroy();
        res.json({ mensaje: 'Libro eliminado correctamente' });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el libro porque tiene préstamos asociados'
            });
        }
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el libro' });
    }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
