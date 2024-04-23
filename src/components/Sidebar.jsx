// Sidebar.jsx
import React from 'react';

import '../styles/Sidebar.css';

function Sidebar({ cart }) {
  return (
    <aside className="sidebar">
      <h2>Resumen de la boleta</h2>
      <ul>
        {Array.isArray(cart) && cart.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
