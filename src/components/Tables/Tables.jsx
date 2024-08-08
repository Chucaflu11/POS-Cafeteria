import React, { useEffect, useState } from 'react';

import { invoke } from '@tauri-apps/api';

import TablesCards from './TablesCards.jsx';

import '../../styles/Tables/Tables.css';

function Tables() {
    const [activeCard, setActiveCard] = useState(null);
    const [tableData, setTableData] = useState(null);


    const handleButtonClick = (mesaNumber) => {
      setActiveCard(activeCard === mesaNumber ? null : mesaNumber);
    };

    const fetchData = () => {
      invoke('get_table_data', { tableId: activeCard })
          .then(setTableData)
          .catch((error) => {
            console.error('Error al obtener los datos de la mesa:', error);
          });
    }

    useEffect(() => {
      if (activeCard) {
        fetchData();
      } else {
        setTableData(null);
      }
    }, [activeCard]);

    
  
    const renderCard = (mesaNumber) => {
      if (activeCard === mesaNumber && tableData) {
        return (
          <TablesCards table={tableData} tableName={`Mesa ${mesaNumber}`} fetchData={fetchData} tableId={mesaNumber} />
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
                        className={activeCard === index + 1 ? 'active' : ''}
                        onClick={() => handleButtonClick(index + 1)}
                    >
                        Mesa {index + 1}
                    </button>
                    </li>
                ))}
            </ul>
          </div>
          {activeCard && renderCard(activeCard)}
        </div>
      );
}

export default Tables;
