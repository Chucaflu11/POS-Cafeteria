import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import '../styles/PaymentModal.css';

function PaymentModal({ cart, setCart, closePayment }) {
  const [paymentMethod, setPaymentMethod] = useState('efectivo'); 
  const [cashPaid, setCashPaid] = useState('');
  const [changeDue, setChangeDue] = useState(0);

  const total = cart.reduce((acc, item) => acc + item.precio_producto, 0);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setCashPaid(''); // Limpiar el campo de efectivo si se cambia a tarjeta
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
    try {
      await invoke('add_check', { cart, paymentMethod });
      setCart([]); // Vaciar el carrito
      closePayment(); // Cerrar el modal
    } catch (error) {
      console.error('Error al registrar la boleta:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closePayment}>X</button>
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
            <p>Vuelto: {changeDue}</p>
          </div>
        )}
        <button className='send-button' onClick={handleCompleteTransaction}>Finalizar transacción</button>
      </div>
    </div>
  );
}

export default PaymentModal;