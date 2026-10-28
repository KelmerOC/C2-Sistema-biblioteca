const { Op } = require('sequelize');
const { Libro, Prestamo } = require('../models');

// GET /libros  (?titulo=)
async function listar(req, res) {
    // FASE 2
}

// GET /libros/:id
async function obtener(req, res) {
    // FASE 2
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
