// Crea el primer administrador. Ejecutar con: npm run seed:admin
const bcrypt = require('bcrypt');
const { sequelize, Usuario } = require('../models');
const { SALT_ROUNDS } = require('../config/auth');

const ADMIN = {
    nombre: 'Administrador',
    email: 'admin@biblioteca.com',
    password: 'Admin123'
};

async function crearAdmin() {
    try {
        await sequelize.authenticate();

        const existente = await Usuario.findOne({ where: { email: ADMIN.email } });
        if (existente) {
            console.log(`El administrador ya existe (${ADMIN.email}).`);
        } else {
            const passwordHash = await bcrypt.hash(ADMIN.password, SALT_ROUNDS);
            await Usuario.create({
                nombre: ADMIN.nombre,
                email: ADMIN.email,
                password: passwordHash,
                rol: 'admin'
            });
            console.log(`Administrador creado -> email: ${ADMIN.email} | password: ${ADMIN.password}`);
        }
    } catch (error) {
        console.error('Error al crear el administrador:', error);
    } finally {
        await sequelize.close();
    }
}

crearAdmin();