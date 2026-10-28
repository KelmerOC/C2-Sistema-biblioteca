const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS } = require('../config/auth');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function datosPublicos(usuario) {
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
}

// POST /auth/register
async function register(req, res) {
    try {
        const { nombre, email, password } = req.body || {};

        if (typeof nombre !== 'string' || typeof email !== 'string' || typeof password !== 'string'
            || !nombre.trim() || !email.trim() || !password) {
            return res.status(400).json({ mensaje: 'nombre, email y password son obligatorios' });
        }

        const emailNormalizado = email.trim().toLowerCase();

        if (!EMAIL_REGEX.test(emailNormalizado)) {
            return res.status(400).json({ mensaje: 'El email no tiene un formato válido' });
        }
        if (password.length < 6) {
            return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const existente = await Usuario.findOne({ where: { email: emailNormalizado } });
        if (existente) {
            return res.status(409).json({ mensaje: 'Ya existe un usuario registrado con ese email' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // El registro público SIEMPRE crea usuarios con rol 'usuario'
        const nuevo = await Usuario.create({
            nombre: nombre.trim(),
            email: emailNormalizado,
            password: passwordHash,
            rol: 'usuario'
        });

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: datosPublicos(nuevo)
        });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ mensaje: 'Error al registrar el usuario' });
    }
}

// POST /auth/login
async function login(req, res) {
    try {
        const { email, password } = req.body || {};

        if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
            return res.status(400).json({ mensaje: 'email y password son obligatorios' });
        }

        const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const coincide = await bcrypt.compare(password, usuario.password);
        if (!coincide) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: datosPublicos(usuario)
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
}

// GET /auth/perfil  (requiere token)
function perfil(req, res) {
    res.json({ usuario: datosPublicos(req.usuario) });
}

module.exports = { register, login, perfil };