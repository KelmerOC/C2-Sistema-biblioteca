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

// POST /libros
async function crear(req, res) {
    // FASE 3
}

// PUT /libros/:id
async function actualizar(req, res) {
    // FASE 3
}

// DELETE /libros/:id
async function eliminar(req, res) {
    // FASE 3
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
