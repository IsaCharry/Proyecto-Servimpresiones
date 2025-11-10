const express = require('express');
const router = express.Router();
const { usuarios, sesionesActivas } = require('../data/usuarios');

// Función para generar token simple (en producción usar JWT)
function generarToken() {
    return 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// POST /api/auth/login - Iniciar sesión
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            error: 'Email y contraseña son requeridos' 
        });
    }

    // Buscar usuario
    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (!usuario) {
        return res.status(401).json({ 
            error: 'Credenciales inválidas' 
        });
    }

    // Generar token
    const token = generarToken();

    // Guardar sesión
    sesionesActivas.set(token, {
        usuarioId: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        fechaLogin: new Date()
    });

    // Retornar usuario sin password
    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
        token,
        usuario: usuarioSinPassword
    });
});

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token && sesionesActivas.has(token)) {
        sesionesActivas.delete(token);
    }

    res.json({ mensaje: 'Sesión cerrada exitosamente' });
});

// GET /api/auth/me - Obtener usuario actual
router.get('/me', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !sesionesActivas.has(token)) {
        return res.status(401).json({ 
            error: 'No autenticado' 
        });
    }

    const sesion = sesionesActivas.get(token);
    const usuario = usuarios.find(u => u.id === sesion.usuarioId);

    if (!usuario) {
        sesionesActivas.delete(token);
        return res.status(401).json({ 
            error: 'Usuario no encontrado' 
        });
    }

    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
        usuario: usuarioSinPassword
    });
});

// Middleware para verificar autenticación
function verificarAutenticacion(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !sesionesActivas.has(token)) {
        return res.status(401).json({ 
            error: 'No autenticado. Por favor inicia sesión.' 
        });
    }

    const sesion = sesionesActivas.get(token);
    req.usuario = sesion;
    next();
}

module.exports = { router, verificarAutenticacion };

