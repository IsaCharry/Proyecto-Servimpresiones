const productos = [
    {
        id: 1,
        nombre: 'Hoodie Personalizado',
        descripcion: 'Hoodie premium con capucha, perfecto para personalizar con tu diseño',
        precio: 85000,
        categoria: 'ropa',
        icono: '👕',
        imagen: 'imgs/hoodie.png',
        opciones: ['color', 'talla', 'texto', 'imagen'],
        colores: [
            { nombre: 'Negro', valor: '#000000' },
            { nombre: 'Blanco', valor: '#FFFFFF' },
            { nombre: 'Gris', valor: '#9CA3AF' },
            { nombre: 'Azul', valor: '#3B82F6' },
            { nombre: 'Rojo', valor: '#EF4444' }
        ],
        tallas: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 2,
        nombre: 'Camiseta Personalizada',
        descripcion: 'Camiseta 100% algodón, ideal para estampar tus diseños favoritos',
        precio: 45000,
        categoria: 'ropa',
        icono: '👔',
        imagen: 'imgs/tshirt.png',
        opciones: ['color', 'talla', 'texto', 'imagen'],
        colores: [
            { nombre: 'Negro', valor: '#000000' },
            { nombre: 'Blanco', valor: '#FFFFFF' },
            { nombre: 'Azul', valor: '#3B82F6' },
            { nombre: 'Rojo', valor: '#EF4444' },
            { nombre: 'Verde', valor: '#10B981' },
            { nombre: 'Amarillo', valor: '#F59E0B' }
        ],
        tallas: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 3,
        nombre: 'Termo Personalizado',
        descripcion: 'Termo de acero inoxidable, mantiene bebidas frías o calientes por horas',
        precio: 55000,
        categoria: 'accesorios',
        icono: '☕',
        imagen: 'imgs/termopng.png',
        opciones: ['color', 'tamaño', 'texto'],
        colores: [
            { nombre: 'Plateado', valor: '#E5E7EB' },
            { nombre: 'Negro', valor: '#000000' },
            { nombre: 'Azul', valor: '#3B82F6' },
            { nombre: 'Rojo', valor: '#EF4444' },
            { nombre: 'Verde', valor: '#10B981' }
        ],
        tamanos: ['350ml', '500ml', '750ml', '1L']
    },
    {
        id: 4,
        nombre: 'Libreta Personalizada',
        descripcion: 'Libreta de alta calidad con tapa dura, perfecta para notas y diseños',
        precio: 35000,
        categoria: 'papeleria',
        icono: '📓',
        imagen: 'imgs/libreta.png',
        opciones: ['tamaño', 'texto'],
        tamanos: ['A5 (15x21cm)', 'A4 (21x30cm)', 'A6 (10x15cm)']
    },
    {
        id: 5,
        nombre: 'Pines Personalizados',
        descripcion: 'Set de pines metálicos con diseño personalizado, perfectos para coleccionar',
        precio: 15000,
        categoria: 'accesorios',
        icono: '📌',
        imagen: 'imgs/pngtree-pin-badges-badge-brooch-mockup-png-image_4732162.png',
        opciones: ['tamaño', 'imagen'],
        tamanos: ['Pequeño (2.5cm)', 'Mediano (4cm)', 'Grande (5.5cm)']
    }
];

module.exports = productos;

