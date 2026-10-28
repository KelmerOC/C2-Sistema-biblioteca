const bcrypt = require('bcrypt');
const { Usuario } = require('../models');
const { SALT_ROUNDS } = require('../config/auth');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['admin', 'usuario'];

function datosPublicos(usuario) {
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
}

// GET /usuarios
async function listar(req, res) {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['password'] },
            order: [['id', 'ASC']]
        });
        res.json(usuarios);
    } catch (error) {
        console.error('Error en listar usuarios:', error);
        res.status(500).json({ mensaje: 'Error al listar los usuarios' });
    }
}

// GET /usuarios/:id
async function obtener(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ mensaje: 'El id debe ser numérico' });
        }

        const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['password'] } });
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.error('Error en obtener usuario:', error);
        res.status(500).json({ mensaje: 'Error al obtener el usuario' });
    }
}

// POST /usuarios  (el admin crea usuarios, pudiendo elegir el rol)
async function crear(req, res) {
    try {
        const { nombre, email, password, rol } = req.body || {};

        if (typeof nombre !== 'string' || typeof email !== 'string' || typeof password !== 'string'
            || !nombre.trim() || !email.trim() || !password) {
            return res.status(400).json({ mensaje: 'nombre, email y password son obligatorios' });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const rolFinal = rol || 'usuario';

        if (!EMAIL_REGEX.test(emailNormalizado)) {
            return res.status(400).json({ mensaje: 'El email no tiene un formato válido' });
        }
        if (password.length < 6) {
            return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
        }
        if (!ROLES.includes(rolFinal)) {
            return res.status(400).json({ mensaje: "El rol debe ser 'admin' o 'usuario'" });
        }

        const existente = await Usuario.findOne({ where: { email: emailNormalizado } });
        if (existente) {
            return res.status(409).json({ mensaje: 'Ya existe un usuario registrado con ese email' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const nuevo = await Usuario.create({
            nombre: nombre.trim(),
            email: emailNormalizado,
            password: passwordHash,
            rol: rolFinal
        });

        res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: datosPublicos(nuevo) });
    } catch (error) {
        console.error('Error en crear usuario:', error);
        res.status(500).json({ mensaje: 'Error al crear el usuario' });
    }
}

// PUT /usuarios/:id  (todos los campos son opcionales)
async function actualizar(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ mensaje: 'El id debe ser numérico' });
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const { nombre, email, password, rol } = req.body || {};
        const cambios = {};

        if (nombre !== undefined) {
            if (typeof nombre !== 'string' || !nombre.trim()) {
                return res.status(400).json({ mensaje: 'El nombre no puede estar vacío' });
            }
            cambios.nombre = nombre.trim();
        }

        if (email !== undefined) {
            if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
                return res.status(400).json({ mensaje: 'El email no tiene un formato válido' });
            }
            const emailNormalizado = email.trim().toLowerCase();
            const otro = await Usuario.findOne({ where: { email: emailNormalizado } });
            if (otro && otro.id !== usuario.id) {
                return res.status(409).json({ mensaje: 'Ya existe un usuario registrado con ese email' });
            }
            cambios.email = emailNormalizado;
        }

        if (password !== undefined) {
            if (typeof password !== 'string' || password.length < 6) {
                return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
            }
            cambios.password = await bcrypt.hash(password, SALT_ROUNDS);
        }

        if (rol !== undefined) {
            if (!ROLES.includes(rol)) {
                return res.status(400).json({ mensaje: "El rol debe ser 'admin' o 'usuario'" });
            }
            if (usuario.id === req.usuario.id && rol !== 'admin') {
                return res.status(400).json({ mensaje: 'No puedes quitarte tu propio rol de administrador' });
            }
            cambios.rol = rol;
        }

        if (Object.keys(cambios).length === 0) {
            return res.status(400).json({ mensaje: 'No se enviaron campos para actualizar' });
        }

        await usuario.update(cambios);

        res.json({ mensaje: 'Usuario actualizado correctamente', usuario: datosPublicos(usuario) });
    } catch (error) {
        console.error('Error en actualizar usuario:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
    }
}

// DELETE /usuarios/:id
async function eliminar(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ mensaje: 'El id debe ser numérico' });
        }
        if (id === req.usuario.id) {
            return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta' });
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        await usuario.destroy();
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({ mensaje: 'No se puede eliminar: el usuario tiene préstamos asociados' });
        }
        console.error('Error en eliminar usuario:', error);
        res.status(500).json({ mensaje: 'Error al eliminar el usuario' });
    }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };