import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import '../styles/CategoryForm.css';

const CategoryForm = ({ closeCatForm, isEditing, setIsEditing, currentCategory }) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && currentCategory) {
      setCategoryName(currentCategory.nombre_categoria);
    } else {
      setCategoryName('');
    }
  }, [isEditing, currentCategory]);

  const handleCategoryNameChange = (event) => {
    setCategoryName(event.target.value);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!categoryName.trim()) {
      setError('El nombre de la categoría no puede estar vacío');
      return;
    }

    try {
      console.log('currentCategory:', currentCategory, 'isEditing:', isEditing);
      if (isEditing && currentCategory) {
        await invoke('update_category', {
          idCategoria: currentCategory.id_categoria,
          nuevoNombre: categoryName,
        });
      } else {
        await invoke('add_category', { nombre: categoryName });
      }
      closeCatForm();
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar la categoría:', error);
      setError('Hubo un error al guardar la categoría. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closeCatForm}>
          X
        </button>
        <h2>{isEditing ? 'Editar Categoría' : 'Agregar Categoría'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="categoryName"
              className="category-name-input"
              value={categoryName}
              onChange={handleCategoryNameChange}
              placeholder='Nombre de la categoría'
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button className='send-category-button' type="submit">{isEditing ? 'Guardar' : 'Agregar'}</button>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;