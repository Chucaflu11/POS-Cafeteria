import React, { useEffect, useState } from 'react';
import '../../styles/Tables/TablesCards.css';

import AddTableProductsModal from './AddTableProductsModal.jsx';
import TablePaymentModal from './TablePaymentModal.jsx';

import { invoke } from '@tauri-apps/api';

function TablesCards({ table, tableName, fetchData, tableId }) {
    const [isTableProductsModalOpen, setIsTableProductsModalOpen] = useState(false);
    const [isTablePaymentModalOpen, setIsTablePaymentModalOpen] = useState(false);

    const openTableProductsModal = () => {
        setIsTableProductsModalOpen(true);
    };

    const closeTableProductsModal = () => {
        setIsTableProductsModalOpen(false);
    };
    
    const openTablePaymentModal = () => {
        setIsTablePaymentModalOpen(true);
    };

    const closeTablePaymentModal = () => {
        setIsTablePaymentModalOpen(false);
    };

    return (
        <div className="tables-cards">
                <div className="tables-header">
                    <div className='tables-details' >
                        <h3>{tableName}</h3>
                        <p>TOTAL  ${table.total}</p>
                    </div>
                    <div className="tables-content-buttons">

                        <div className="tables-card-buttons">
                            <button onClick={openTableProductsModal}>
                                Agregar
                            </button>
                            {isTableProductsModalOpen && (
                                <AddTableProductsModal closeTableProductsModal={closeTableProductsModal} fetchData={fetchData} tableId={tableId} />
                            )}
                            
                            <button>
                                Cocina Ticket
                            </button>

                            <button>
                                Garzón Ticket
                            </button>
                            </div>
                            <button className="tables-card-pay-button" onClick={openTablePaymentModal}>
                                Pagar
                            </button>
                            {isTablePaymentModalOpen && (
                                <TablePaymentModal closeTablePaymentModal={closeTablePaymentModal} tableId={tableId} totalTable={table.total} fetchData={fetchData} />
                            )}
                    </div>
                </div>

                <div className="tables-products-details">
                    <ul className="tables-products-list">
                        {table.products.map((product, index) => (
                            <li key={`${product.id_producto}-${product.nombre_producto}-${index}`}>
                                {product.nombre_producto} - ${product.precio_producto}
                            </li>
                        ))}
                    </ul>
                </div>
        </div>
    );
}

export default TablesCards;
