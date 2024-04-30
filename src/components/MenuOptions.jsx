// MenuOptions.js
import React from 'react';

import '../styles/MenuOptions.css';

function MenuOptions({ setSelectedCategory, categories }) {

  return (
    <div className="menu-options">
      {categories.map((category, index) => (
        <button key={index} onClick={() => setSelectedCategory(category)}>
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default MenuOptions;
