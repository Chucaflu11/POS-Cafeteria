import React, { useState } from 'react';
import '../../styles/Tables/TablesCards.css';
import { invoke } from '@tauri-apps/api';

function TablesCards({ table }) {
    
    // mock data
    const tableData = {
        "mesa": {
            "id_mesa": 1,
            "nombre_mesa": "Mesa 1",
            "transacciones": [
                {
                    "id_transaccion_mesa": 1,
                    "id_producto": 101,
                    "cantidad": 2,
                    "producto": {
                        "nombre_producto": "Producto 1",
                        "precio_producto": 100,
                        "id_categoria": 1,
                        "activo": true
                    }
                },
                {
                    "id_transaccion_mesa": 2,
                    "id_producto": 102,
                    "cantidad": 1,
                    "producto": {
                        "nombre_producto": "Producto 2",
                        "precio_producto": 150,
                        "id_categoria": 2,
                        "activo": false
                    }
                },
                {
                    "id_transaccion_mesa": 3,
                    "id_producto": 103,
                    "cantidad": 3,
                    "producto": {
                        "nombre_producto": "Producto 3",
                        "precio_producto": 200,
                        "id_categoria": 1,
                        "activo": true
                    }
                }
            ]
        }
    };

    const calculateTotal = (transacciones) => {
        return transacciones.reduce((total, transaccion) => total + transaccion.cantidad * transaccion.producto.precio_producto, 0);
    };

    const total = calculateTotal(tableData.mesa.transacciones);

    return (
        <div className="tables-cards">
                <div className="tables-header">
                    <div className='tables-details' >
                        <h3>{tableData.mesa.nombre_mesa}</h3>
                        <p>TOTAL  ${total}</p>
                    </div>
                    <div className="tables-content-buttons">

                        <div className="tables-card-buttons">
                            <button>
                                Agregar
                            </button>
                            
                            <button>
                                Cocina Ticket
                            </button>

                            <button>
                                Garzón Ticket
                            </button>
                            </div>
                            <button className="tables-card-pay-button">
                                Pagar
                            </button>
                    </div>
                </div>

                <div className="tables-products-details">
                    <ul className='tables-products-list'>
                        {tableData.mesa.transacciones.map((transaccion, index) => (
                            <li key={`${transaccion.id_transaccion_mesa}-${index}`}>
                                {transaccion.producto.nombre_producto} - ${transaccion.producto.precio_producto} x {transaccion.cantidad}
                            </li>
                        ))}
                    </ul>
                </div>
        </div>
    );
}

export default TablesCards;
