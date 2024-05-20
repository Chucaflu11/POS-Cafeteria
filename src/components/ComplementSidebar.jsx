import React from 'react';
import '../styles/ComplementSidebar.css';

function ComplementSidebar({ cart, setCart, setSelectedCategory }) {
  const removeLastItem = () => {
    const newCart = [...cart];
    newCart.pop();
    setCart(newCart);
  };

  const goBackToCategories = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="ComplementSidebar">
      <div className="button-container">
        <button onClick={removeLastItem}>Remover último ítem</button>
        <button onClick={goBackToCategories}> Retroceder </button>
        <button>Botón 3</button>
      </div>
    </div>
  );
}

export default ComplementSidebar;
