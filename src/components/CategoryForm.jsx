import React, { useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import '../styles/CategoryForm.css';

function CategoryForm({ closeCatForm }) {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setCategoryName(event.target.value);
    setError('');
  };

  const addCategory = (event) => {
    event.preventDefault();

    if (!categoryName.trim()) {
      setError('El nombre de la categoría no puede estar vacío');
      return;
    }
    try {
      invoke("add_category", { nombre: categoryName });
    } catch (error) {
      setError('Error al agregar la categoría');
    }
    closeCatForm();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closeCatForm}>X</button>
        <h2>Categoría</h2>
        <form>
          <div>
            <input
              type="text"
              name="nombre"
              className='input-category-name'
              value={categoryName}
              onChange={handleInputChange}
              placeholder="Ingrese el nombre de la categoría"
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div>
            <button className='send-button' onClick={addCategory} type="submit">Enviar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;