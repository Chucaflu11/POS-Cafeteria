// MenuOptions.js
import React from 'react';

import '../styles/MenuOptions.css';

function MenuOptions({ setSelectedCategory }) {
  const categories = [
    'Bebidas calientes',
    'Bebidas frías',
    'Postres',
    'Desayunos',
    'Almuerzos',
    'Cena',
    'Snacks',
    'Ensaladas',
    'Sopas',
    'Pizza',
    'Hamburguesas',
    'Sushi',
    'Comida mexicana',
    'Comida italiana',
    'Comida asiática',
    'Comida rápida',
    'Comida gourmet',
    'Vegetariano',
    'Vegano',
    'Comida casera'
  ];
  

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
