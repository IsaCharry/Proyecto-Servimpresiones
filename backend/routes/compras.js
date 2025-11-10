const express = require('express');
const router = express.Router();
const { compras, generarIdOrden } = require('../data/compras');
const { verificarAutenticacion } = require('./auth');

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// POST /api/compras - Crear nueva compra
router.post('/', (req, res) => {
    const { items, cliente } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
            error: 'Debe incluir al menos un producto' 
        });
    }

    if (!cliente || !cliente.nombre || !cliente.email || !cliente.telefono || !cliente.direccion) {
        return res.status(400).json({ 
            error: 'Información del cliente incompleta' 
        });
    }

    // Calcular total
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Crear compra
    const nuevaCompra = {
        id: generarIdOrden(),
        usuarioId: req.usuario.usuarioId,
        fecha: new Date().toISOString(),
        items,
        total,
        cliente,
        estado: 'procesando' // procesando, enviado, entregado
    };

    compras.push(nuevaCompra);

    res.status(201).json({
        mensaje: 'Compra creada exitosamente',
        compra: nuevaCompra
    });
});

// GET /api/compras - Listar compras del usuario autenticado
router.get('/', (req, res) => {
    const comprasUsuario = compras
        .filter(c => c.usuarioId === req.usuario.usuarioId)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Más recientes primero

    res.json({
        compras: comprasUsuario,
        total: comprasUsuario.length
    });
});

// GET /api/compras/:id - Obtener detalle de una compra
router.get('/:id', (req, res) => {
    const compra = compras.find(c => c.id === req.params.id);

    if (!compra) {
        return res.status(404).json({ 
            error: 'Compra no encontrada' 
        });
    }

    // Verificar que la compra pertenece al usuario (o es admin)
    if (compra.usuarioId !== req.usuario.usuarioId && req.usuario.rol !== 'admin') {
        return res.status(403).json({ 
            error: 'No tienes permiso para ver esta compra' 
        });
    }

    res.json({ compra });
});

// PATCH /api/compras/:id/estado - Actualizar estado de compra (solo admin)
router.patch('/:id/estado', (req, res) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ 
            error: 'No tienes permisos para realizar esta acción' 
        });
    }

    const { estado } = req.body;
    const estadosValidos = ['procesando', 'enviado', 'entregado'];

    if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({ 
            error: 'Estado inválido. Debe ser: procesando, enviado o entregado' 
        });
    }

    const compra = compras.find(c => c.id === req.params.id);

    if (!compra) {
        return res.status(404).json({ 
            error: 'Compra no encontrada' 
        });
    }

    compra.estado = estado;
    compra.ultimaActualizacion = new Date().toISOString();

    res.json({
        mensaje: 'Estado actualizado exitosamente',
        compra
    });
});

// GET /api/compras/admin/todas - Listar todas las compras (solo admin)
router.get('/admin/todas', (req, res) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ 
            error: 'No tienes permisos para realizar esta acción' 
        });
    }

    res.json({
        compras: compras.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
        total: compras.length
    });
});

module.exports = router;

