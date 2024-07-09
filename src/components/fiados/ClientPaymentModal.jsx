import React, { useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import '../../styles/fiados/ClientPaymentModal.css'

function ClientPaymentModal({ closeClientPaymentModal, debtId, fetchData }) {
    const [partialPayment, setPartialPayment] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (event) => {
        setPartialPayment(event.target.value);
        setError('');
    };

    const partialPay= (event) => {
        event.preventDefault();

        if (!partialPayment.trim()) {
            setError('El monto no puede estar vacío');
            return;
        }
        try {
            let amountPaid = parseInt(partialPayment);
            const pay = invoke('pay_partial_debt', { debtId: debtId, amount: amountPaid });
            fetchData();
        } catch (error) {
            console.error('Error al obtener datos de la base de datos:', error);
        }
        closeClientPaymentModal();

    };

    return (
        <div className="modal-overlay">
            <div className="modal-client-content">
                <div className='client-form-header'>
                    <h2>Pago</h2>
                    <button className="close-client-form-button" onClick={closeClientPaymentModal}>X</button>
                </div>
                <form>
                    <div>
                        <input className='client-name-input'
                            type="number"
                            name="pago"
                            value={partialPayment}
                            onChange={handleInputChange}
                            placeholder="Ingrese el monto a abonar"
                        />
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div className='send-button-container'>
                        <button className='send-client-button' onClick={partialPay} type="submit">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientPaymentModal;