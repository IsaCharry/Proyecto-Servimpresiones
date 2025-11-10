const compras = [];

let contadorOrdenes = 1;

function generarIdOrden() {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const numero = String(contadorOrdenes++).padStart(3, '0');
    return `ORD-${year}${month}${day}-${numero}`;
}

module.exports = {
    compras,
    generarIdOrden
};

