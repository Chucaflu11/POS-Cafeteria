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

    const printCocinaTicket = async (table) => {
        const { products, total } = table;

        let ticketText = '======= Cocina ========\n';
        products.forEach((product, index) => {
            ticketText += `${index + 1}. ${product.nombre_producto}\n`;
        });
        ticketText += '=======================\0';
        
        await invoke('print_voucher', { elements: ticketText });
    };

    const printGarzonTicket = async (table) => {
        const { products, total } = table;
        const subtotal = total;
        const propina = subtotal * 0.1;
        
        let ticketText = '======= Boleta ========\n';
        products.forEach((product, index) => {
            ticketText += `${index + 1}. ${product.nombre_producto} - $${product.precio_producto}\n`;
        });
        ticketText += '\n';
        ticketText += `Subtotal: $${subtotal}\n`;
        ticketText += `Propina sugerida (10%): $${propina}\n`;
        ticketText += `Total: $${total + propina}\n`;
        ticketText += '=======================\0';
    
        await invoke('print_voucher', { elements: ticketText });
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
                            
                            <button onClick={() => printCocinaTicket(table)}>
                                Cocina Ticket
                            </button>

                            <button onClick={() => printGarzonTicket(table)}>
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
