// Configuración de autenticación (Módulo 2)
module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'biblioteca_secreto_dev_2026',
    JWT_EXPIRES_IN: '8h',
    SALT_ROUNDS: 10
};