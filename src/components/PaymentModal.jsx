import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

import '../styles/PaymentModal.css';

function PaymentModal({ cart, setCart, closePayment }) {
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cashPaid, setCashPaid] = useState('');
  const [changeDue, setChangeDue] = useState(0);
  const [tip, setTip] = useState(0);

  const [error, setError] = useState('');

  const total = cart.reduce((acc, item) => acc + item.precio_producto, 0);

  useEffect(() => {
    setTip(total * 0.1);
  }, [total]);

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

  const handleTipChange = (event) => {
    const tipAmount = parseInt(event.target.value);
    if (!isNaN(tipAmount)) {
      setTip(tipAmount);
    } else {
      setTip(0);
    }
  };

  const handleCompleteTransaction = async () => {
    if (cart.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    const paidAmount = parseFloat(cashPaid);
    if ((isNaN(paidAmount) || paidAmount < 0) && paymentMethod === 'efectivo') {
      setError('El monto pagado no es válido');
      return;
    }
    if (paymentMethod === 'efectivo' && paidAmount < total) {
      setError('El monto pagado no es suficiente');
      return;
    }
    try {
      await invoke('add_check', { cart, paymentMethod, tip, tableId: 0 });
      setCart([]);
      closePayment();
    } catch (error) {
      setError('Error al completar la transacción: ' + error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-payment-button" onClick={closePayment}>X</button>
        <h2>Pago</h2>
        <div style={{ marginBottom: "10px" }}>
          <select className="paymentMethod" value={paymentMethod} onChange={handlePaymentMethodChange}>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>
        <div className='tip-container'>
          <label> Propina: </label>
        <input type="number" className="tip" pattern="[0-9]*" value={tip} onChange={handleTipChange} placeholder={'Propina' + tip} />
        </div>
        {paymentMethod === 'efectivo' && (
          <div>
            <input type="number" className="cashPaid" pattern="[0-9]*" value={cashPaid} onChange={handleCashPaidChange} placeholder='Efectivo recibido' />
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