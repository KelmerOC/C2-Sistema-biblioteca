const express = require('express');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const libroRoutes = require('./routes/libro.routes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensaje: 'Servidor funcionando correctamente' });
});

// ===== Módulo 2: autenticación y usuarios =====
app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);

// ===== Módulo 3: libros y préstamos =====
app.use('/libros', libroRoutes);

// Manejo de errores (siempre al final de las rutas)
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ mensaje: 'JSON inválido en el cuerpo de la petición' });
    }
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
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