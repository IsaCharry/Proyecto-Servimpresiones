const express = require('express');
const router = express.Router();
const productos = require('../data/productos');

// GET /api/productos - Listar todos los productos
router.get('/', (req, res) => {
    res.json({
        productos,
        total: productos.length
    });
});

// GET /api/productos/:id - Obtener un producto por ID
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const producto = productos.find(p => p.id === id);

    if (!producto) {
        return res.status(404).json({ 
            error: 'Producto no encontrado' 
        });
    }

    res.json({ producto });
});

module.exports = router;

