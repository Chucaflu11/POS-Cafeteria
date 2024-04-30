import React from 'react';
import '../styles/Footer.css';

function Footer({ cart, setCart }) {
  const removeLastItem = () => {
    const newCart = [...cart];
    newCart.pop();
    setCart(newCart);
  };

  return (
    <footer className="footer">
      <div className="button-container">
        <button onClick={removeLastItem}>Remove Last Item</button>
        <button>Botón 2</button>
        <button>Botón 3</button>
        <button>Botón 4</button>
        <button>Botón 5</button>
        <button>Botón 6</button>
      </div>
    </footer>
  );
}

export default Footer;
