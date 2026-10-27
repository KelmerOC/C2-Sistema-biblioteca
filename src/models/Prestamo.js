const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prestamo = sequelize.define('Prestamo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    codigo: { type: DataTypes.STRING, allowNull: true, unique: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    libro_id: { type: DataTypes.INTEGER, allowNull: false },
    fecha_prestamo: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_devolucion: { type: DataTypes.DATEONLY, allowNull: true },
    estado: { type: DataTypes.ENUM('pendiente', 'prestado', 'devuelto'), allowNull: false, defaultValue: 'pendiente' }
}, { tableName: 'prestamos', timestamps: false });

module.exports = Prestamo;