import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import '../../styles/Tables/TablePaymentModal.css'

function TablePaymentModal({ closeTablePaymentModal, tableId, totalTable, fetchData }) {
    const [payment, setPayment] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [error, setError] = useState('');
    const [tip, setTip] = useState(0);

    const handleInputChange = (event) => {
        setPayment(event.target.value);
        setError('');
    };

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    useEffect(() => {
        if(payment >= totalTable){
            setTip(parseInt(totalTable) * 0.1);
        } else {
            setTip(0);
        }
      }, [payment, totalTable]);

    const handleTipChange = (event) => {
        const tipAmount = parseInt(event.target.value);
        if (!isNaN(tipAmount)) {
          setTip(tipAmount);
        } else {
          setTip(0);
        }
    };

    const payTable = (event) => {
        event.preventDefault();
    
        if (!payment.trim()) {
            setError('El monto no puede estar vacío');
            return;
        }
        invoke('pay_table_transaction', { tableId: tableId, paymentMethod: paymentMethod, tip: tip })
            .then(() => {
                fetchData();
            })
            .catch((error) => {
                console.error('Error al agregar el pago a la base de datos:', error);
            });
    
        closeTablePaymentModal();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-pay-content">
                <div className='pay-form-header'>
                    <h2>Pago</h2>
                    <button className="close-pay-form-button" onClick={closeTablePaymentModal}>X</button>
                </div>
                <form>
                    <div>
                        <input className='pay-amount-input'
                            type="number"
                            name="pago"
                            value={payment}
                            onChange={handleInputChange}
                            placeholder="Ingrese el monto a abonar"
                        />
                    </div>
                    <div>
                        <select className='payment-method-select' value={paymentMethod} onChange={handlePaymentMethodChange}>
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                        </select>
                    </div>
                    <div className='tip-container'>
                        <label>Propina:</label>
                        <input className='tip-input' type="number" name="tip" value={tip} onChange={handleTipChange} placeholder="Propina" />
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div className='send-button-container'>
                        <button className='send-pay-button' onClick={payTable} type="submit">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TablePaymentModal;