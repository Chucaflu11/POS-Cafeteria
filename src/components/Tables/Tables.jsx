import React, { useEffect, useState } from 'react';

import { invoke } from '@tauri-apps/api';

import '../../styles/Tables/Tables.css';

function Tables() {
    const [activeCard, setActiveCard] = useState(null);

    const handleButtonClick = (mesaNumber) => {
      setActiveCard(activeCard === mesaNumber ? null : mesaNumber);
    };
  
    const renderCard = (mesaNumber) => {
      if (activeCard === mesaNumber) {
        return (
          <div className="table-card">
            <h2>Mesa {mesaNumber}</h2>
          </div>
        );
      }
      return null;
    };
  
    return (
        <div className="tables-content">
          <div className="tables-buttons">
            <ul className="buttons-list-ul">
                {[...Array(10)].map((_, index) => (
                    <li key={index} className="buttons-list-li">
                    <button
                        className={activeCard === index + 1 ? 'active' : ''} // Clase 'active' si está seleccionado
                        onClick={() => handleButtonClick(index + 1)}
                    >
                        Mesa {index + 1}
                    </button>
                    </li>
                ))}
            </ul>
          </div>

          {[...Array(10)].map((_, index) => renderCard(index + 1))}
        </div>
      );
}

export default Tables;
