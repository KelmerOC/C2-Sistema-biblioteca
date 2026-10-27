const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('biblioteca_db', 'root', '', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize;