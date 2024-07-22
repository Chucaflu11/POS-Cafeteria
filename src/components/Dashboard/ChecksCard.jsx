import React from 'react';

import '../../styles/Dashboard/ChecksCard.css';

function ChecksCards({ checks }) {

    return (
        <div className='cards'>
            {checks.map((check, index) => (
                <div key={index} className='check-card'>
                    <h2>Boleta: {check.id_boleta}</h2>
                    <p>Fecha: {check.fecha}</p>
                    <p>Método de Pago: {check.metodo_pago}</p>
                    <p>Total: {check.total}</p>
                    <p>Propina: {check.propina}</p>
                    {check.numero_mesa !== 0 && <p>Mesa: {check.numero_mesa}</p>}
                    <h3>Detalles:</h3>
                    {check.detalles && check.detalles.length > 0 ? (
                        check.detalles.map((detalle, detalleIndex) => (
                            <div key={detalleIndex} className='card-details'>
                                <p>Nombre Producto: {detalle.nombre_producto}</p>
                                <p>Cantidad: {detalle.cantidad}</p>
                                <p>Precio Unitario: {detalle.precio_unitario}</p>
                            </div>
                        ))
                    ) : <p className='no-details'>Sin detalles</p>}
                </div>
            ))}
        </div>
    );
}

export default ChecksCards;
