const usuarios = [
    {
        id: 1,
        email: 'isabella@serviimpresiones.com',
        password: '123456',
        nombre: 'Isabella Charry',
        rol: 'cliente'
    },
    {
        id: 2,
        email: 'andrea@serviimpresiones.com',
        password: '123456',
        nombre: 'Andrea López',
        rol: 'cliente'
    },
    {
        id: 3,
        email: 'admin@serviimpresiones.com',
        password: 'admin123',
        nombre: 'Administrador',
        rol: 'admin'
    }
];

const sesionesActivas = new Map();

module.exports = {
    usuarios,
    sesionesActivas
};

