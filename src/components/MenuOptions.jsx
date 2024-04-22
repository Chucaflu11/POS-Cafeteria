// MenuOptions.js
import React from 'react';

import '../styles/MenuOptions.css';

function MenuOptions({ setSelectedCategory }) {
  const categories = ['Bebidas', 'Pasteles', 'Sandwiches']; // Ejemplo de categorías

  return (
    <div className="menu-options">
      {categories.map((category, index) => (
        <button key={index} onClick={() => setSelectedCategory(category)}>
          {category}
        </button>
      ))}
    </div>
  );
}

export default MenuOptions;
