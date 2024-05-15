import React from 'react';
import '../styles/ComplementSidebar.css';

function ComplementSidebar({ cart, setCart }) {
  const removeLastItem = () => {
    const newCart = [...cart];
    newCart.pop();
    setCart(newCart);
  };

  return (
    <div className="ComplementSidebar">
      <div className="button-container">
        <button onClick={removeLastItem}>Remover último ítem</button>
        <button>Botón 2</button>
        <button>Botón 3</button>
      </div>
    </div>
  );
}

export default ComplementSidebar;
