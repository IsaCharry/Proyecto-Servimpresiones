
const API_URL = 'http://localhost:3000/api';

let productos = [];
let carrito = [];
let productoActual = null;
let seccionActual = 'inicio';
let usuarioActual = null;
let authToken = null;
let misCompras = [];
let compraActual = null;


async function fetchAPI(endpoint, options = {}) {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Agregar token si existe
        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('Error en API:', error);
        throw error;
    }
}

// Funciones de API - Autenticación
async function loginAPI(email, password) {
    const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    return data;
}

async function logoutAPI() {
    try {
        await fetchAPI('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

async function obtenerUsuarioActual() {
    const data = await fetchAPI('/auth/me');
    return data.usuario;
}

// Funciones de API - Productos
async function obtenerProductos() {
    const data = await fetchAPI('/productos');
    return data.productos;
}

async function obtenerProductoPorId(id) {
    const data = await fetchAPI(`/productos/${id}`);
    return data.producto;
}

// Funciones de API - Compras
async function crearCompraAPI(datosCompra) {
    const data = await fetchAPI('/compras', {
        method: 'POST',
        body: JSON.stringify(datosCompra)
    });
    return data.compra;
}

async function obtenerMisCompras() {
    const data = await fetchAPI('/compras');
    return data.compras;
}

async function obtenerDetalleCompra(id) {
    const data = await fetchAPI(`/compras/${id}`);
    return data.compra;
}

function cargarSesionDesdeLocalStorage() {
    const tokenGuardado = localStorage.getItem('serviimpresiones_token');
    const usuarioGuardado = localStorage.getItem('serviimpresiones_usuario');
    
    if (tokenGuardado && usuarioGuardado) {
        authToken = tokenGuardado;
        usuarioActual = JSON.parse(usuarioGuardado);
        actualizarUIUsuario();
    }
}

function guardarSesionEnLocalStorage(token, usuario) {
    localStorage.setItem('serviimpresiones_token', token);
    localStorage.setItem('serviimpresiones_usuario', JSON.stringify(usuario));
    authToken = token;
    usuarioActual = usuario;
}

function cerrarSesionLocal() {
    localStorage.removeItem('serviimpresiones_token');
    localStorage.removeItem('serviimpresiones_usuario');
    authToken = null;
    usuarioActual = null;
}

async function login(email, password) {
    try {
        const data = await loginAPI(email, password);
        guardarSesionEnLocalStorage(data.token, data.usuario);
        actualizarUIUsuario();
        cerrarModalLogin();
        mostrarNotificacion(`¡Bienvenido ${data.usuario.nombre}!`);
        return true;
    } catch (error) {
        mostrarNotificacion('Error: ' + error.message, 'error');
        return false;
    }
}

async function logout() {
    await logoutAPI();
    cerrarSesionLocal();
    actualizarUIUsuario();
    navegarA('inicio');
    mostrarNotificacion('Sesión cerrada exitosamente');
}

function verificarAutenticacion() {
    if (!authToken || !usuarioActual) {
        abrirModalLogin();
        return false;
    }
    return true;
}

function actualizarUIUsuario() {
    const btnUsuario = document.getElementById('btnUsuario');
    
    if (usuarioActual) {
        // Usuario autenticado
        btnUsuario.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        `;
        btnUsuario.title = usuarioActual.nombre;
        btnUsuario.style.color = 'var(--color-primario)';
        
        // Mostrar opción Mis Compras en el menú
        const menuMisCompras = document.querySelector('[data-seccion="mis-compras"]');
        if (menuMisCompras) {
            menuMisCompras.parentElement.style.display = 'block';
        }
    } else {
        // Usuario no autenticado
        btnUsuario.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        `;
        btnUsuario.title = 'Iniciar sesión';
        btnUsuario.style.color = '';
        
        // Ocultar opción Mis Compras del menú
        const menuMisCompras = document.querySelector('[data-seccion="mis-compras"]');
        if (menuMisCompras) {
            menuMisCompras.parentElement.style.display = 'none';
        }
    }
}

async function inicializarApp() {
    cargarSesionDesdeLocalStorage();
    cargarCarritoDesdeLocalStorage();
    actualizarContadorCarrito();
    actualizarUIUsuario();
    configurarEventosNavegacion();
    configurarEventosCarrito();
    configurarEventosAuth();
    
    // Cargar productos desde la API
    try {
        productos = await obtenerProductos();
        renderizarProductosDestacados();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarNotificacion('Error al cargar productos. ¿El servidor está corriendo?', 'error');
    }
    
    navegarA('inicio');
}

function configurarEventosAuth() {
    // Botón de usuario - abrir modal de login o menú
    document.getElementById('btnUsuario').addEventListener('click', () => {
        if (usuarioActual) {
            mostrarMenuUsuario();
        } else {
            abrirModalLogin();
        }
    });
    
    // Formulario de login
    document.getElementById('formLogin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await login(email, password);
    });
    
    // Botón cerrar sesión
    document.getElementById('btnCerrarSesion').addEventListener('click', logout);
}

function configurarEventosNavegacion() {
    // Enlaces del menú
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const seccion = e.target.dataset.seccion;
            navegarA(seccion);
            
            // Cerrar menú móvil si está abierto
            document.getElementById('menu').classList.remove('activo');
        });
    });
    
    // Enlaces del footer
    const footerLinks = document.querySelectorAll('.footer-lista a[data-seccion]');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const seccion = e.target.dataset.seccion;
            navegarA(seccion);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Botones de navegación
    const botonesNavegar = document.querySelectorAll('[data-navegar]');
    botonesNavegar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const seccion = e.target.dataset.navegar;
            navegarA(seccion);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Botón volver a productos
    document.getElementById('btnVolverProductos').addEventListener('click', () => {
        navegarA('productos');
    });
    
    // Toggle menú móvil
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('menu').classList.toggle('activo');
    });
    
    // Formulario de contacto del footer
    document.getElementById('formContactoFooter').addEventListener('submit', manejarFormularioContacto);
    
    // Formulario de contacto principal
    const formContactoPrincipal = document.getElementById('formContactoPrincipal');
    if (formContactoPrincipal) {
        formContactoPrincipal.addEventListener('submit', manejarFormularioContacto);
    }
}

async function navegarA(seccion) {
    // Verificar autenticación para secciones protegidas
    if (seccion === 'mis-compras' && !verificarAutenticacion()) {
        return;
    }
    
    // Ocultar todas las vistas
    const vistas = document.querySelectorAll('.vista');
    vistas.forEach(vista => {
        vista.classList.remove('vista-activa');
    });
    
    // Mostrar vista seleccionada
    const vistaActiva = document.getElementById(`vista-${seccion}`);
    if (vistaActiva) {
        vistaActiva.classList.add('vista-activa');
    }
    
    // Actualizar menú activo
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.classList.remove('activo');
        if (link.dataset.seccion === seccion) {
            link.classList.add('activo');
        }
    });
    
    // Renderizar contenido específico de la sección
    if (seccion === 'productos') {
        renderizarListaProductos();
    } else if (seccion === 'mis-compras') {
        await cargarYRenderizarMisCompras();
    }
    
    seccionActual = seccion;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderizarProductosDestacados() {
    const contenedor = document.getElementById('productosDestacados');
    const productosDestacados = productos.slice(0, 3);
    
    contenedor.innerHTML = productosDestacados.map(producto => `
        <div class="producto-card" onclick="verDetalleProducto(${producto.id})">
            <div class="producto-imagen">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            </div>
            <div class="producto-info">
                <h4 class="producto-nombre">${producto.nombre}</h4>
                <p class="producto-descripcion">${producto.descripcion}</p>
                <p class="producto-precio">$${formatearPrecio(producto.precio)}</p>
                <button class="btn btn-primario producto-btn">Personalizar</button>
            </div>
        </div>
    `).join('');
}

function renderizarListaProductos() {
    const contenedor = document.getElementById('listaProductos');
    
    contenedor.innerHTML = productos.map(producto => `
        <div class="producto-card" onclick="verDetalleProducto(${producto.id})">
            <div class="producto-imagen">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            </div>
            <div class="producto-info">
                <h4 class="producto-nombre">${producto.nombre}</h4>
                <p class="producto-descripcion">${producto.descripcion}</p>
                <p class="producto-precio">$${formatearPrecio(producto.precio)}</p>
                <button class="btn btn-primario producto-btn">Personalizar</button>
            </div>
        </div>
    `).join('');
}

function verDetalleProducto(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;
    
    productoActual = producto;
    renderizarDetalleProducto(producto);
    
    // Mostrar vista de detalle
    document.querySelectorAll('.vista').forEach(v => v.classList.remove('vista-activa'));
    document.getElementById('vista-detalle-producto').classList.add('vista-activa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderizarDetalleProducto(producto) {
    const contenedor = document.getElementById('detalleProducto');
    
    let opcionesHTML = '';
    
    // Opciones de Color
    if (producto.opciones.includes('color')) {
        opcionesHTML += `
            <div class="form-grupo">
                <label>Color *</label>
                <div class="opciones-colores" id="opcionesColor">
                    ${producto.colores.map((color, index) => `
                        <div class="color-opcion ${index === 0 ? 'seleccionado' : ''}" 
                             style="background-color: ${color.valor}; ${color.valor === '#FFFFFF' ? 'border: 2px solid #e5e7eb;' : ''}"
                             data-color="${color.nombre}"
                             onclick="seleccionarColor(this)">
                        </div>
                    `).join('')}
                    <div class="color-opcion color-personalizado" 
                         onclick="abrirSelectorColorPersonalizado()"
                         title="Color personalizado">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <input type="color" id="inputColorPersonalizado" style="display: none;">
                </div>
                <input type="hidden" id="colorSeleccionado" value="${producto.colores[0].nombre}">
            </div>
        `;
    }
    
    // Opciones de Talla
    if (producto.opciones.includes('talla')) {
        opcionesHTML += `
            <div class="form-grupo">
                <label for="tallaSeleccionada">Talla *</label>
                <select id="tallaSeleccionada" required>
                    ${producto.tallas.map(talla => `<option value="${talla}">${talla}</option>`).join('')}
                </select>
            </div>
        `;
    }
    
    // Opciones de Tamaño
    if (producto.opciones.includes('tamaño')) {
        opcionesHTML += `
            <div class="form-grupo">
                <label for="tamanoSeleccionado">Tamaño *</label>
                <select id="tamanoSeleccionado" required>
                    ${producto.tamanos.map(tamano => `<option value="${tamano}">${tamano}</option>`).join('')}
                </select>
            </div>
        `;
    }
    
    // Opción de Texto Personalizado
    if (producto.opciones.includes('texto')) {
        opcionesHTML += `
            <div class="form-grupo">
                <label for="textoPersonalizado">Texto Personalizado (opcional)</label>
                <textarea id="textoPersonalizado" rows="3" placeholder="Ingresa el texto que deseas en tu producto"></textarea>
            </div>
        `;
    }
    
    // Opción de Imagen Personalizada
    if (producto.opciones.includes('imagen')) {
        opcionesHTML += `
            <div class="form-grupo">
                <label for="imagenPersonalizada">Imagen Personalizada (opcional)</label>
                <input type="file" id="imagenPersonalizada" accept="image/*">
                <small style="color: var(--color-texto-secundario);">Formatos aceptados: JPG, PNG. Máx 5MB</small>
            </div>
        `;
    }
    
    contenedor.innerHTML = `
        <div class="detalle-grid">
            <div class="detalle-imagen" data-categoria="${producto.categoria}">
                <div class="producto-preview-container">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
                    <div class="custom-image-overlay" id="customImageOverlay"></div>
                </div>
            </div>
            <div class="detalle-info">
                <h2>${producto.nombre}</h2>
                <p style="color: var(--color-texto-secundario); margin-bottom: 1rem;">${producto.descripcion}</p>
                <p class="detalle-precio">$${formatearPrecio(producto.precio)}</p>
                
                <form class="personalizacion-form" id="formPersonalizacion">
                    ${opcionesHTML}
                    
                    <div class="form-grupo">
                        <label for="cantidad">Cantidad *</label>
                        <input type="number" id="cantidad" value="1" min="1" max="100" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primario btn-block btn-grande">
                        Agregar al Carrito
                    </button>
                </form>
            </div>
        </div>
    `;
    
    // Configurar evento de submit
    document.getElementById('formPersonalizacion').addEventListener('submit', (e) => {
        e.preventDefault();
        agregarProductoAlCarrito();
    });
    
    // Configurar preview de imagen personalizada
    if (producto.opciones.includes('imagen')) {
        const inputImagen = document.getElementById('imagenPersonalizada');
        inputImagen.addEventListener('change', function(e) {
            mostrarVistaPrevia(e.target.files[0]);
        });
    }
}

function seleccionarColor(elemento) {
    // Remover selección anterior
    elemento.parentElement.querySelectorAll('.color-opcion').forEach(el => {
        el.classList.remove('seleccionado');
    });
    
    // Agregar selección al nuevo color
    elemento.classList.add('seleccionado');
    
    // Actualizar valor oculto
    const colorNombre = elemento.dataset.color;
    document.getElementById('colorSeleccionado').value = colorNombre;
}

function abrirSelectorColorPersonalizado() {
    const input = document.getElementById('inputColorPersonalizado');
    input.click();
    
    input.onchange = function() {
        const colorPersonalizado = this.value;
        
        // Deseleccionar otros colores
        document.querySelectorAll('.color-opcion').forEach(el => {
            el.classList.remove('seleccionado');
        });
        
        // Marcar el botón personalizado como seleccionado
        const botonPersonalizado = document.querySelector('.color-personalizado');
        botonPersonalizado.classList.add('seleccionado');
        botonPersonalizado.style.background = colorPersonalizado;
        
        // Actualizar el valor oculto con el color personalizado
        document.getElementById('colorSeleccionado').value = `Personalizado (${colorPersonalizado})`;
    };
}

function mostrarVistaPrevia(file) {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        mostrarNotificacion('Por favor selecciona un archivo de imagen válido', 'error');
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        mostrarNotificacion('La imagen debe ser menor a 5MB', 'error');
        return;
    }
    
    const overlay = document.getElementById('customImageOverlay');
    if (!overlay) return;
    
    // Read file and create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        overlay.innerHTML = `
            <img src="${e.target.result}" alt="Preview" class="custom-preview-img">
            <button class="btn-remove-preview" onclick="limpiarVistaPrevia()" title="Quitar imagen">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        overlay.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function limpiarVistaPrevia() {
    const overlay = document.getElementById('customImageOverlay');
    const inputImagen = document.getElementById('imagenPersonalizada');
    
    if (overlay) {
        overlay.innerHTML = '';
        overlay.style.display = 'none';
    }
    
    if (inputImagen) {
        inputImagen.value = '';
    }
}

function configurarEventosCarrito() {
    // Botón abrir carrito
    document.getElementById('btnCarrito').addEventListener('click', abrirModalCarrito);
    
    // Botones cerrar modal carrito
    document.getElementById('cerrarModalCarrito').addEventListener('click', cerrarModalCarrito);
    document.getElementById('modalCarrito').addEventListener('click', (e) => {
        if (e.target.id === 'modalCarrito') {
            cerrarModalCarrito();
        }
    });
    
    // Botón finalizar compra
    document.getElementById('btnFinalizarCompra').addEventListener('click', abrirModalCheckout);
    
    // Modal checkout
    document.getElementById('cerrarModalCheckout').addEventListener('click', cerrarModalCheckout);
    document.getElementById('modalCheckout').addEventListener('click', (e) => {
        if (e.target.id === 'modalCheckout') {
            cerrarModalCheckout();
        }
    });
    
    // Formulario checkout
    document.getElementById('formCheckout').addEventListener('submit', procesarCheckout);
    
    // Modal confirmación
    document.getElementById('cerrarModalConfirmacion').addEventListener('click', cerrarModalConfirmacion);
}

function agregarProductoAlCarrito() {
    if (!productoActual) return;
    
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        mostrarNotificacion('Debes iniciar sesión para agregar productos al carrito', 'error');
        return;
    }
    
    // Recopilar datos de personalización
    const personalizacion = {
        cantidad: parseInt(document.getElementById('cantidad').value)
    };
    
    // Color
    if (productoActual.opciones.includes('color')) {
        personalizacion.color = document.getElementById('colorSeleccionado').value;
    }
    
    // Talla
    if (productoActual.opciones.includes('talla')) {
        personalizacion.talla = document.getElementById('tallaSeleccionada').value;
    }
    
    // Tamaño
    if (productoActual.opciones.includes('tamaño')) {
        personalizacion.tamano = document.getElementById('tamanoSeleccionado').value;
    }
    
    // Texto
    if (productoActual.opciones.includes('texto')) {
        const texto = document.getElementById('textoPersonalizado').value;
        if (texto) personalizacion.texto = texto;
    }
    
    // Imagen
    if (productoActual.opciones.includes('imagen')) {
        const imagen = document.getElementById('imagenPersonalizada');
        if (imagen.files.length > 0) {
            personalizacion.imagen = imagen.files[0].name;
        }
    }
    
    // Crear item del carrito
    const itemCarrito = {
        id: Date.now(), // ID único para el item del carrito
        producto: { ...productoActual },
        personalizacion: personalizacion,
        subtotal: productoActual.precio * personalizacion.cantidad
    };
    
    carrito.push(itemCarrito);
    guardarCarritoEnLocalStorage();
    actualizarContadorCarrito();
    
    // Mostrar confirmación y abrir carrito
    mostrarNotificacion('Producto agregado al carrito');
    setTimeout(() => {
        abrirModalCarrito();
    }, 500);
}

function eliminarDelCarrito(idItem) {
    carrito = carrito.filter(item => item.id !== idItem);
    guardarCarritoEnLocalStorage();
    actualizarContadorCarrito();
    renderizarCarrito();
}

function actualizarCantidadCarrito(idItem, nuevaCantidad) {
    const item = carrito.find(item => item.id === idItem);
    if (item && nuevaCantidad > 0) {
        item.personalizacion.cantidad = nuevaCantidad;
        item.subtotal = item.producto.precio * nuevaCantidad;
        guardarCarritoEnLocalStorage();
        renderizarCarrito();
    }
}

function obtenerTotalCarrito() {
    return carrito.reduce((total, item) => total + item.subtotal, 0);
}

function vaciarCarrito() {
    carrito = [];
    guardarCarritoEnLocalStorage();
    actualizarContadorCarrito();
    renderizarCarrito();
}

function actualizarContadorCarrito() {
    const contador = carrito.reduce((total, item) => total + item.personalizacion.cantidad, 0);
    document.getElementById('contadorCarrito').textContent = contador;
}

function guardarCarritoEnLocalStorage() {
    try {
        localStorage.setItem('serviimpresiones_carrito', JSON.stringify(carrito));
    } catch (error) {
        console.error('Error al guardar el carrito:', error);
    }
}

function cargarCarritoDesdeLocalStorage() {
    try {
        const carritoGuardado = localStorage.getItem('serviimpresiones_carrito');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        carrito = [];
    }
}

function abrirModalCarrito() {
    renderizarCarrito();
    document.getElementById('modalCarrito').classList.add('activo');
    document.body.style.overflow = 'hidden';
}

function cerrarModalCarrito() {
    document.getElementById('modalCarrito').classList.remove('activo');
    document.body.style.overflow = '';
}

function renderizarCarrito() {
    const contenedor = document.getElementById('contenidoCarrito');
    const totalElement = document.getElementById('totalCarrito');
    
    if (carrito.length === 0) {
        contenedor.innerHTML = '<div class="carrito-vacio"><p>Tu carrito está vacío</p></div>';
        totalElement.textContent = '$0';
        return;
    }
    
    contenedor.innerHTML = carrito.map(item => {
        const detalles = [];
        if (item.personalizacion.color) detalles.push(`Color: ${item.personalizacion.color}`);
        if (item.personalizacion.talla) detalles.push(`Talla: ${item.personalizacion.talla}`);
        if (item.personalizacion.tamano) detalles.push(`Tamaño: ${item.personalizacion.tamano}`);
        if (item.personalizacion.texto) detalles.push(`Texto: "${item.personalizacion.texto}"`);
        if (item.personalizacion.imagen) detalles.push(`Imagen: ${item.personalizacion.imagen}`);
        
        return `
            <div class="carrito-item">
                <div class="carrito-item-imagen">
                    <img src="${item.producto.imagen}" alt="${item.producto.nombre}" class="producto-img">
                </div>
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${item.producto.nombre}</div>
                    <div class="carrito-item-detalles">${detalles.join(' • ')}</div>
                    <div class="carrito-item-precio">$${formatearPrecio(item.producto.precio)} × ${item.personalizacion.cantidad} = $${formatearPrecio(item.subtotal)}</div>
                    <div class="carrito-item-controles">
                        <div class="cantidad-control">
                            <button class="cantidad-btn" onclick="actualizarCantidadCarrito(${item.id}, ${item.personalizacion.cantidad - 1})">-</button>
                            <span class="cantidad-valor">${item.personalizacion.cantidad}</span>
                            <button class="cantidad-btn" onclick="actualizarCantidadCarrito(${item.id}, ${item.personalizacion.cantidad + 1})">+</button>
                        </div>
                        <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    totalElement.textContent = `$${formatearPrecio(obtenerTotalCarrito())}`;
}

function abrirModalCheckout() {
    if (carrito.length === 0) {
        mostrarNotificacion('Tu carrito está vacío');
        return;
    }
    
    cerrarModalCarrito();
    document.getElementById('totalCheckout').textContent = `$${formatearPrecio(obtenerTotalCarrito())}`;
    document.getElementById('modalCheckout').classList.add('activo');
    document.body.style.overflow = 'hidden';
}

function cerrarModalCheckout() {
    document.getElementById('modalCheckout').classList.remove('activo');
    document.body.style.overflow = '';
    document.getElementById('formCheckout').reset();
}

async function procesarCheckout(e) {
    e.preventDefault();
    
    if (!verificarAutenticacion()) {
        cerrarModalCheckout();
        return;
    }
    
    try {
        const datosCompra = {
            items: carrito,
            cliente: {
                nombre: document.getElementById('checkoutNombre').value,
                email: document.getElementById('checkoutEmail').value,
                telefono: document.getElementById('checkoutTelefono').value,
                direccion: document.getElementById('checkoutDireccion').value
            }
        };
        
        // Enviar compra al backend
        const compra = await crearCompraAPI(datosCompra);
        
        // Guardar número de orden para mostrar
        const numeroOrden = compra.id;
        
        // Vaciar carrito
        vaciarCarrito();
        
        // Cerrar modal checkout
        cerrarModalCheckout();
        
        // Mostrar modal de confirmación con número de orden
        mostrarModalConfirmacionCompra(numeroOrden);
        
    } catch (error) {
        mostrarNotificacion('Error al procesar la compra: ' + error.message, 'error');
    }
}

function cerrarModalConfirmacion() {
    document.getElementById('modalConfirmacion').classList.remove('activo');
    document.body.style.overflow = '';
    navegarA('inicio');
}


function manejarFormularioContacto(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const datos = {
        nombre: formData.get('nombre'),
        correo: formData.get('correo'),
        celular: formData.get('celular'),
        mensaje: formData.get('mensaje')
    };
    
    console.log('Formulario de contacto enviado:', datos);
    
    mostrarNotificacion('¡Mensaje enviado! Te contactaremos pronto.');
    e.target.reset();
}

function formatearPrecio(precio) {
    return precio.toLocaleString('es-CO');
}

function obtenerGradiente(categoria) {
    const gradientes = {
        ropa: '#667eea 0%, #764ba2 100%',
        accesorios: '#f093fb 0%, #f5576c 100%',
        papeleria: '#4facfe 0%, #00f2fe 100%'
    };
    return gradientes[categoria] || '#667eea 0%, #764ba2 100%';
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    const colorFondo = tipo === 'error' ? '#ef4444' : '#10b981';
    
    notificacion.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colorFondo};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

function abrirModalLogin() {
    document.getElementById('modalLogin').classList.add('activo');
    document.body.style.overflow = 'hidden';
}

function cerrarModalLogin() {
    document.getElementById('modalLogin').classList.remove('activo');
    document.body.style.overflow = '';
    document.getElementById('formLogin').reset();
}

function mostrarMenuUsuario() {
    const menu = document.getElementById('menuUsuario');
    const isVisible = menu.classList.contains('activo');
    
    if (isVisible) {
        menu.classList.remove('activo');
    } else {
        // Actualizar nombre en el menú
        document.getElementById('nombreUsuarioMenu').textContent = usuarioActual.nombre;
        menu.classList.add('activo');
        
        // Cerrar al hacer clic fuera
        setTimeout(() => {
            document.addEventListener('click', cerrarMenuUsuarioAlClickFuera);
        }, 100);
    }
}

function cerrarMenuUsuarioAlClickFuera(e) {
    const menu = document.getElementById('menuUsuario');
    const btnUsuario = document.getElementById('btnUsuario');
    
    if (!menu.contains(e.target) && e.target !== btnUsuario && !btnUsuario.contains(e.target)) {
        menu.classList.remove('activo');
        document.removeEventListener('click', cerrarMenuUsuarioAlClickFuera);
    }
}

function mostrarModalConfirmacionCompra(numeroOrden) {
    const modal = document.getElementById('modalConfirmacion');
    const mensajeElement = modal.querySelector('.confirmacion-mensaje');
    
    if (mensajeElement) {
        mensajeElement.innerHTML = `
            <p><strong>Número de orden: ${numeroOrden}</strong></p>
            <p>Tu pedido ha sido procesado exitosamente. Te contactaremos pronto para coordinar la entrega.</p>
        `;
    }
    
    modal.classList.add('activo');
}

async function cargarYRenderizarMisCompras() {
    try {
        misCompras = await obtenerMisCompras();
        renderizarMisCompras();
    } catch (error) {
        console.error('Error al cargar compras:', error);
        mostrarNotificacion('Error al cargar tus compras', 'error');
    }
}

function renderizarMisCompras() {
    const contenedor = document.getElementById('listaMisCompras');
    
    if (!misCompras || misCompras.length === 0) {
        contenedor.innerHTML = `
            <div class="compras-vacio">
                <p>Aún no has realizado ninguna compra</p>
                <button class="btn btn-primario" onclick="navegarA('productos')">Ver Productos</button>
            </div>
        `;
        return;
    }
    
    contenedor.innerHTML = misCompras.map(compra => {
        const fecha = new Date(compra.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const estadoBadge = obtenerBadgeEstado(compra.estado);
        
        return `
            <div class="compra-card" onclick="verDetalleCompra('${compra.id}')">
                <div class="compra-header">
                    <div>
                        <strong class="compra-numero">Orden #${compra.id}</strong>
                        <p class="compra-fecha">${fechaFormateada}</p>
                    </div>
                    ${estadoBadge}
                </div>
                <div class="compra-items">
                    <p>${compra.items.length} producto(s)</p>
                </div>
                <div class="compra-footer">
                    <span class="compra-total">Total: $${formatearPrecio(compra.total)}</span>
                    <button class="btn btn-secundario btn-pequeno">Ver Detalle</button>
                </div>
            </div>
        `;
    }).join('');
}

function obtenerBadgeEstado(estado) {
    const badges = {
        procesando: '<span class="badge badge-procesando">🔄 Procesando</span>',
        enviado: '<span class="badge badge-enviado">📦 Enviado</span>',
        entregado: '<span class="badge badge-entregado">✅ Entregado</span>'
    };
    return badges[estado] || badges.procesando;
}

async function verDetalleCompra(idCompra) {
    try {
        compraActual = await obtenerDetalleCompra(idCompra);
        renderizarDetalleCompra();
        
        // Cambiar a vista de detalle
        document.getElementById('vista-mis-compras').classList.remove('vista-activa');
        document.getElementById('vista-detalle-compra').classList.add('vista-activa');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error al cargar detalle:', error);
        mostrarNotificacion('Error al cargar el detalle de la compra', 'error');
    }
}

function renderizarDetalleCompra() {
    const contenedor = document.getElementById('detalleCompraContenido');
    const fecha = new Date(compraActual.fecha);
    const fechaFormateada = fecha.toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const estadoBadge = obtenerBadgeEstado(compraActual.estado);
    
    contenedor.innerHTML = `
        <div class="detalle-compra-header">
            <div>
                <h3>Orden #${compraActual.id}</h3>
                <p class="fecha-compra">${fechaFormateada}</p>
            </div>
            ${estadoBadge}
        </div>
        
        <div class="timeline-estado">
            <div class="timeline-item ${compraActual.estado === 'procesando' || compraActual.estado === 'enviado' || compraActual.estado === 'entregado' ? 'activo' : ''}">
                <div class="timeline-punto"></div>
                <div class="timeline-contenido">
                    <strong>Procesando</strong>
                    <p>Tu orden está siendo preparada</p>
                </div>
            </div>
            <div class="timeline-item ${compraActual.estado === 'enviado' || compraActual.estado === 'entregado' ? 'activo' : ''}">
                <div class="timeline-punto"></div>
                <div class="timeline-contenido">
                    <strong>Enviado</strong>
                    <p>Tu orden está en camino</p>
                </div>
            </div>
            <div class="timeline-item ${compraActual.estado === 'entregado' ? 'activo' : ''}">
                <div class="timeline-punto"></div>
                <div class="timeline-contenido">
                    <strong>Entregado</strong>
                    <p>Tu orden ha sido entregada</p>
                </div>
            </div>
        </div>
        
        <div class="seccion-productos-compra">
            <h4>Productos</h4>
            ${compraActual.items.map(item => {
                const detalles = [];
                if (item.personalizacion.color) detalles.push(`Color: ${item.personalizacion.color}`);
                if (item.personalizacion.talla) detalles.push(`Talla: ${item.personalizacion.talla}`);
                if (item.personalizacion.tamano) detalles.push(`Tamaño: ${item.personalizacion.tamano}`);
                if (item.personalizacion.texto) detalles.push(`Texto: "${item.personalizacion.texto}"`);
                
                return `
                    <div class="producto-compra-item">
                        <div class="producto-compra-icono">
                            <img src="${item.producto.imagen}" alt="${item.producto.nombre}" class="producto-img">
                        </div>
                        <div class="producto-compra-info">
                            <strong>${item.producto.nombre}</strong>
                            <p class="producto-compra-detalles">${detalles.join(' • ')}</p>
                            <p class="producto-compra-precio">$${formatearPrecio(item.producto.precio)} × ${item.personalizacion.cantidad} = $${formatearPrecio(item.subtotal)}</p>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="seccion-cliente-compra">
            <h4>Información de entrega</h4>
            <div class="info-cliente">
                <p><strong>Nombre:</strong> ${compraActual.cliente.nombre}</p>
                <p><strong>Email:</strong> ${compraActual.cliente.email}</p>
                <p><strong>Teléfono:</strong> ${compraActual.cliente.telefono}</p>
                <p><strong>Dirección:</strong> ${compraActual.cliente.direccion}</p>
            </div>
        </div>
        
        <div class="total-compra-detalle">
            <strong>Total:</strong>
            <span>$${formatearPrecio(compraActual.total)}</span>
        </div>
    `;
}

function volverAMisCompras() {
    document.getElementById('vista-detalle-compra').classList.remove('vista-activa');
    navegarA('mis-compras');
}

// Agregar estilos de animación para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', inicializarApp);