## Pasos para ejecutar el proyecto

### 1. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 2. Iniciar el servidor backend
```bash
npm start
```

**El servidor debe estar corriendo en http://localhost:3000**

### 3. Abrir el frontend
Abrir el archivo `index.html` en tu navegador.

---

## Importante

**SIEMPRE** debes tener el backend corriendo antes de usar la aplicación, de lo contrario verás este error en la consola:

```
Error al cargar productos. ¿El servidor está corriendo?
```

---

## Usuarios de Prueba

Para probar la aplicación, usa uno de estos usuarios:

**Usuario 1:**
- Email: `isabella@serviimpresiones.com`
- Password: `123456`

**Usuario 2:**
- Email: `andrea@serviimpresiones.com`
- Password: `123456`

**Admin:**
- Email: `admin@serviimpresiones.com`
- Password: `admin123`

---

## Flujo de Prueba Recomendado

1. **Abrir la aplicación** (index.html)
2. **Click en el icono de usuario** → Iniciar sesión con cualquiera de los usuarios
3. **Ir a "Productos"** en el menú
4. **Click en un producto** para personalizarlo
5. **Seleccionar opciones** (color, talla, texto, etc.)
6. **Agregar al carrito**
7. **Click en el icono del carrito** → Ver productos
8. **Finalizar Compra** → Completar formulario
9. **Ir a "Mis Compras"** → Ver historial
10. **Click en una orden** → Ver detalle completo

---

## Problemas Comunes

### No se cargan los productos
**Solución:** Verifica que el backend esté corriendo en http://localhost:3000

### El carrito se vacía
**Solución:** No uses modo incógnito, el carrito usa localStorage
