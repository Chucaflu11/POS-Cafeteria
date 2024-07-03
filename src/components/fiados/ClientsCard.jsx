import React, { useState } from 'react';

import '../../styles/fiados/ClientsCard.css';

function ClientsCard({ fetchedClients }) {
    const [tarjetasAbiertas, setTarjetasAbiertas] = useState({});

    const toggleDetalles = (clientId) => {
        setTarjetasAbiertas((prevTarjetasAbiertas) => ({
            ...prevTarjetasAbiertas,
            [clientId]: !prevTarjetasAbiertas[clientId],
        }));
    };

    async function addCreditTransaction(clientId) {
        console.log('Agregando transacción de crédito para el cliente con ID:', clientId);
        // try {
        //     const cart = [{
        //         id_producto: 1,
        //         nombre_producto: 'Sprite',
        //         id_categoria: 1,
        //         precio_producto: 1200
        //     }];

        //     const response = await invoke('add_credit_transaction', {
        //         cart,
        //         clientId
        //     });
        //     console.log('Transacción de crédito agregada correctamente:', response);
        //     return response;
        // } catch (error) {
        //     console.error('Error al agregar transacción de crédito:', error);
        //     throw error;
        // }
    }

    return (
        <div className="clients-cards">
            {fetchedClients.map((cliente) => (
                <div key={cliente.client_id} className={`cliente ${tarjetasAbiertas[cliente.client_id] ? 'activo' : ''}`}>
                    <div className="encabezado">
                        <h3>{cliente.client_name}</h3>
                        {tarjetasAbiertas[cliente.client_id] && (
                        <div className="contenido">
                            <div className="detalles-deuda">
                                <p>Total: ${cliente.total_debt} </p>
                                <p>Pagado: ${cliente.amount_paid} </p>
                                <p>Restante: ${cliente.remaining_debt} </p>
                            </div>
                            
                                <div className="card-buttons">
                                    <button onClick={() => addCreditTransaction(cliente.client_id)}>
                                        Agregar
                                    </button>
                                    <button >
                                        Editar
                                    </button>
                                    <button className="pagar-button">
                                        Pagar
                                    </button>
                                </div>
                        </div>
                        )}
                        <button className="arrow-button" onClick={() => toggleDetalles(cliente.client_id)}>
                            {tarjetasAbiertas[cliente.client_id] ?
                                <svg className='arrow-up'
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M17.6569 16.2427L19.0711 14.8285L12.0001 7.75739L4.92896 14.8285L6.34317 16.2427L12.0001 10.5858L17.6569 16.2427Z"
                                        fill="currentColor"
                                    />
                                </svg>

                                :
                                <svg className='arrow-down'
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            }
                        </button>
                    </div>
                    {tarjetasAbiertas[cliente.client_id] && cliente.debt_id !== 0 && (
                        <div className="detalle-productos">
                            <ul>
                                {cliente.products.map((producto) => (
                                    <li key={`${producto.product_id}-${producto.transaction_date}`}>
                                        {producto.product_name} - ${producto.product_price} x {producto.quantity} - {producto.transaction_date}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ClientsCard;
