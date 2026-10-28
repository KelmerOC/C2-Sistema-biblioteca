const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { JWT_SECRET } = require('../config/auth');

// Verifica el token JWT y deja el usuario autenticado en req.usuario
async function verificarToken(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const [tipo, token] = header.split(' ');

        if (tipo !== 'Bearer' || !token) {
            return res.status(401).json({ mensaje: 'Acceso denegado: token no proporcionado' });
        }

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ mensaje: 'Token inválido o expirado' });
        }

        const usuario = await Usuario.findByPk(payload.id, {
            attributes: { exclude: ['password'] }
        });

        if (!usuario) {
            return res.status(401).json({ mensaje: 'El usuario del token ya no existe' });
        }

        req.usuario = usuario; // { id, nombre, email, rol }
        next();
    } catch (error) {
        console.error('Error en verificarToken:', error);
        res.status(500).json({ mensaje: 'Error al verificar la autenticación' });
    }
}

// Control de acceso por roles. Ejemplo: permitirRoles('admin', 'usuario')
function permitirRoles(...roles) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ mensaje: 'Acceso denegado: no autenticado' });
        }
        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({ mensaje: 'Acceso denegado: no tienes permisos para esta acción' });
        }
        next();
    };
}

const soloAdmin = permitirRoles('admin');

module.exports = { verificarToken, permitirRoles, soloAdmin };