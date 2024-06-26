// Sidebar.jsx
import React, {useState} from 'react';
import PaymentModal from './PaymentModal';

import '../styles/Sidebar.css';

function Sidebar({ cart, setCart }) {
  const total = cart.reduce((acc, item) => acc + item.precio_producto, 0);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const openPayment = () => {
    setIsPaymentOpen(true);
  };

  const closePayment = () => {
    setIsPaymentOpen(false);
  };

  return (
    <div className="sidebar">
      <div className='check' >
        <h2>Resumen de la boleta</h2>
        <ul>
          {Array.isArray(cart) && cart.map((item, index) => (
            <li key={index}>
              <span>{item.nombre_producto}</span>
              <span>${item.precio_producto}</span>
            </li>
          ))}
        </ul>
        <div className="total">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </div>
      <button className="pay-button" onClick={openPayment}>Pagar</button>
      {isPaymentOpen && (
          <PaymentModal cart={cart} setCart={setCart} closePayment={closePayment}  />
          )}
    </div>
  );
}

export default Sidebar;
