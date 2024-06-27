import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import '../styles/PaymentModal.css';

function PaymentModal({ cart, setCart, closePayment }) {
  const [paymentMethod, setPaymentMethod] = useState('efectivo'); 
  const [cashPaid, setCashPaid] = useState('');
  const [changeDue, setChangeDue] = useState(0);

  const [error, setError] = useState('');

  const total = cart.reduce((acc, item) => acc + item.precio_producto, 0);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setCashPaid('');
    setError('');
    setChangeDue(0);
  };

    const handleCashPaidChange = (event) => {
        const paid = parseFloat(event.target.value);
        if (!isNaN(paid)) {
            setCashPaid(event.target.value);
            setChangeDue(Math.max(0, paid - total));
        } else {
            setCashPaid('');
            setChangeDue(0); 
        }
    };

  const handleCompleteTransaction = async () => {
    if(cart.length > 0) {
      try {
        await invoke('add_check', { cart, paymentMethod });
        setCart([]);
        closePayment();
      } catch (error) {
        setError('Error al completar la transacción');
      }
    }
    else{
      setError('El carrito está vacío');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-payment-button" onClick={closePayment}>X</button>
        <h2>Pago</h2>
        <div style={{marginBottom:"10px"}}>
          <label htmlFor="paymentMethod">Método de pago: </label>
          <select id="paymentMethod" value={paymentMethod} onChange={handlePaymentMethodChange}>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>
        {paymentMethod === 'efectivo' && (
          <div>
            <label htmlFor="cashPaid">Efectivo recibido:</label>
            <input type="number" id="cashPaid" value={cashPaid} onChange={handleCashPaidChange} />
            <p>Vuelto: {changeDue.toLocaleString()}</p>
          </div>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button className='send-payment-button' onClick={handleCompleteTransaction}>Finalizar transacción</button>
      </div>
    </div>
  );
}

export default PaymentModal;