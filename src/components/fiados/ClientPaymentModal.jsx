import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import '../../styles/fiados/ClientPaymentModal.css'

function ClientPaymentModal({ closeClientPaymentModal, debtId, totalDebt, remainingDebt, fetchData }) {
    const [partialPayment, setPartialPayment] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [error, setError] = useState('');
    const [tip, setTip] = useState(0);

    const handleInputChange = (event) => {
        setPartialPayment(event.target.value);
        setError('');
    };

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    useEffect(() => {
        if(partialPayment >= remainingDebt){
            setTip(parseInt(totalDebt) * 0.1);
        } else {
            setTip(0);
        }
      }, [partialPayment, remainingDebt, totalDebt]);

    const handleTipChange = (event) => {
        const tipAmount = parseInt(event.target.value);
        if (!isNaN(tipAmount)) {
          setTip(tipAmount);
        } else {
          setTip(0);
        }
    };

    const partialPay= (event) => {
        event.preventDefault();

        if (!partialPayment.trim()) {
            setError('El monto no puede estar vacío');
            return;
        }
        try {
            let amountPaid = parseInt(partialPayment);
            const pay = invoke('pay_partial_debt', { debtId: debtId, amount: amountPaid, paymentMethod: paymentMethod, tip: tip });
            fetchData();
        } catch (error) {
            console.error('Error al obtener datos de la base de datos:', error);
        }
        closeClientPaymentModal();

    };

    return (
        <div className="modal-overlay">
            <div className="modal-pay-content">
                <div className='pay-form-header'>
                    <h2>Pago</h2>
                    <button className="close-pay-form-button" onClick={closeClientPaymentModal}>X</button>
                </div>
                <form>
                    <div>
                        <input className='pay-amount-input'
                            type="number"
                            name="pago"
                            value={partialPayment}
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
                        <button className='send-pay-button' onClick={partialPay} type="submit">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientPaymentModal;