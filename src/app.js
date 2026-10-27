const express = require('express');
const { sequelize } = require('./models');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensaje: 'Servidor funcionando correctamente' });
});

const PORT = 3000;

async function iniciar() {
    try {
        await sequelize.authenticate();
        console.log('Conexion exitosa con MySQL.');
        await sequelize.sync();
        console.log('Modelos sincronizados.');

        app.listen(PORT, () => {
            console.log(`Servidor activo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
}

iniciar();