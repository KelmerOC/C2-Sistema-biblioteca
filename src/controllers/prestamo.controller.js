const crypto = require('crypto');
const { Op } = require('sequelize');
const { Prestamo, Libro, Usuario, sequelize } = require('../models');

// Helper: devuelve la fecha de hoy en formato YYYY-MM-DD usando la hora local
function obtenerFechaHoy() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

// POST /prestamos
async function solicitar(req, res) {
    try {
        const { libro_id } = req.body || {};
        const idLibro = parseInt(libro_id, 10);

        if (libro_id === undefined || libro_id === null || Number.isNaN(idLibro) || !Number.isInteger(Number(libro_id)) || idLibro <= 0) {
            return res.status(400).json({ mensaje: 'El campo libro_id debe ser un entero positivo válido' });
        }

        const libro = await Libro.findByPk(idLibro);
        if (!libro) {
            return res.status(404).json({ mensaje: 'Libro no encontrado' });
        }

        if (libro.cantidad <= 0) {
            return res.status(409).json({ mensaje: 'No hay ejemplares disponibles de este libro' });
        }

        const prestamoExistente = await Prestamo.findOne({
            where: {
                usuario_id: req.usuario.id,
                libro_id: idLibro,
                estado: { [Op.in]: ['pendiente', 'prestado'] }
            }
        });

        if (prestamoExistente) {
            return res.status(409).json({
                mensaje: 'Ya tienes una solicitud pendiente o un préstamo activo de este libro'
            });
        }

        let prestamo = null;
        let intentos = 3;
        let errorUnicidad = null;

        while (intentos > 0) {
            try {
                const codigo = crypto.randomBytes(4).toString('hex');
                prestamo = await Prestamo.create({
                    codigo,
                    usuario_id: req.usuario.id,
                    libro_id: idLibro,
                    fecha_prestamo: obtenerFechaHoy(),
                    fecha_devolucion: null,
                    estado: 'pendiente'
                });
                break;
            } catch (err) {
                if (err.name === 'SequelizeUniqueConstraintError') {
                    errorUnicidad = err;
                    intentos--;
                } else {
                    throw err;
                }
            }
        }

        if (!prestamo) {
            console.error('Error al generar código único tras reintentos:', errorUnicidad);
            return res.status(500).json({ mensaje: 'Error al generar un código único para el préstamo' });
        }

        res.status(201).json({
            mensaje: 'Solicitud de préstamo creada correctamente',
            prestamo
        });
    } catch (error) {
        console.error('Error en solicitar préstamo:', error);
        res.status(500).json({ mensaje: 'Error al solicitar el préstamo' });
    }
}

// PUT /prestamos/:id/aprobar
async function aprobar(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ mensaje: 'El id debe ser numérico' });
        }

        let prestamoAprobado;

        await sequelize.transaction(async (transaction) => {
            const prestamo = await Prestamo.findByPk(id, {
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!prestamo) {
                const err = new Error('Préstamo no encontrado');
                err.statusCode = 404;
                throw err;
            }

            if (prestamo.estado !== 'pendiente') {
                const err = new Error(`No se puede aprobar un préstamo en estado '${prestamo.estado}'`);
                err.statusCode = 409;
                throw err;
            }

            const libro = await Libro.findByPk(prestamo.libro_id, {
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!libro) {
                const err = new Error('Libro no encontrado');
                err.statusCode = 404;
                throw err;
            }

            if (libro.cantidad <= 0) {
                const err = new Error('No hay stock disponible para aprobar el préstamo');
                err.statusCode = 409;
                throw err;
            }

            libro.cantidad -= 1;
            await libro.save({ transaction });

            prestamo.estado = 'prestado';
            prestamo.fecha_prestamo = obtenerFechaHoy();
            await prestamo.save({ transaction });

            prestamoAprobado = prestamo;
        });

        res.json({
            mensaje: 'Préstamo aprobado correctamente',
            prestamo: prestamoAprobado
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ mensaje: error.message });
        }
        console.error('Error en aprobar préstamo:', error);
        res.status(500).json({ mensaje: 'Error al aprobar el préstamo' });
    }
}

// PUT /prestamos/:id/devolver
async function devolver(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ mensaje: 'El id debe ser numérico' });
        }

        let prestamoDevuelto;

        await sequelize.transaction(async (transaction) => {
            const prestamo = await Prestamo.findByPk(id, {
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!prestamo) {
                const err = new Error('Préstamo no encontrado');
                err.statusCode = 404;
                throw err;
            }

            if (prestamo.estado !== 'prestado') {
                const err = new Error(`No se puede devolver un préstamo en estado '${prestamo.estado}'`);
                err.statusCode = 409;
                throw err;
            }

            const libro = await Libro.findByPk(prestamo.libro_id, {
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!libro) {
                const err = new Error('Libro no encontrado');
                err.statusCode = 404;
                throw err;
            }

            libro.cantidad += 1;
            await libro.save({ transaction });

            prestamo.estado = 'devuelto';
            prestamo.fecha_devolucion = obtenerFechaHoy();
            await prestamo.save({ transaction });

            prestamoDevuelto = prestamo;
        });

        res.json({
            mensaje: 'Préstamo devuelto correctamente',
            prestamo: prestamoDevuelto
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ mensaje: error.message });
        }
        console.error('Error en devolver préstamo:', error);
        res.status(500).json({ mensaje: 'Error al registrar la devolución del préstamo' });
    }
}

// GET /prestamos
async function listar(req, res) {
    try {
        const where = {};
        if (req.usuario.rol !== 'admin') {
            where.usuario_id = req.usuario.id;
        }

        const prestamos = await Prestamo.findAll({
            where,
            include: [
                { model: Libro, attributes: ['titulo', 'autor'] },
                { model: Usuario, attributes: ['nombre', 'email'] }
            ],
            order: [['id', 'DESC']]
        });

        res.json(prestamos);
    } catch (error) {
        console.error('Error en listar préstamos:', error);
        res.status(500).json({ mensaje: 'Error al listar los préstamos' });
    }
}

// GET /prestamos/:id
async function obtener(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ mensaje: 'El id debe ser numérico' });
        }

        const prestamo = await Prestamo.findByPk(id, {
            include: [
                { model: Libro, attributes: ['titulo', 'autor'] },
                { model: Usuario, attributes: ['nombre', 'email'] }
            ]
        });

        if (!prestamo) {
            return res.status(404).json({ mensaje: 'Préstamo no encontrado' });
        }

        if (req.usuario.rol !== 'admin' && prestamo.usuario_id !== req.usuario.id) {
            return res.status(403).json({ mensaje: 'Acceso denegado: no tienes permisos para ver este préstamo' });
        }

        res.json(prestamo);
    } catch (error) {
        console.error('Error en obtener préstamo:', error);
        res.status(500).json({ mensaje: 'Error al obtener el préstamo' });
    }
}

module.exports = {
    solicitar,
    aprobar,
    devolver,
    listar,
    obtener
};

