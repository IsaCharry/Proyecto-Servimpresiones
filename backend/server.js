const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { router: authRouter } = require('./routes/auth');
const productosRouter = require('./routes/productos');
const comprasRouter = require('./routes/compras');

const app = express();
const PORT = 3000;

// Permitir solicitudes desde el frontend
app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logs
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas 
app.use('/api/auth', authRouter);
app.use('/api/productos', productosRouter);
app.use('/api/compras', comprasRouter);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de Serviimpresiones Neiva',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/auth/me'
            },
            productos: {
                listar: 'GET /api/productos',
                obtener: 'GET /api/productos/:id'
            },
            compras: {
                crear: 'POST /api/compras',
                listar: 'GET /api/compras',
                obtener: 'GET /api/compras/:id',
                actualizarEstado: 'PATCH /api/compras/:id/estado (admin)'
            }
        },
        usuariosPrueba: [
            { email: 'isabella@serviimpresiones.com', password: '123456' },
            { email: 'andrea@serviimpresiones.com', password: '123456' },
            { email: 'admin@serviimpresiones.com', password: 'admin123' }
        ]
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        mensaje: err.message 
    });
});

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada' 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
  
});

module.exports = app;

