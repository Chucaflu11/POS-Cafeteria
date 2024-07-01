import React, {useState} from 'react';
import '../styles/ComplementSidebar.css';
import CategoryForm from './CategoryForm';
import ProductForm from './ProductForm';

import { invoke } from '@tauri-apps/api/tauri';

function ComplementSidebar({ cart, setCart, fetchData, categories }) {
  const removeLastItem = () => {
    const newCart = [...cart];
    newCart.pop();
    setCart(newCart);
  };

  async function deleteCategory(categoryId) {
    try {
      await invoke('delete_category', { categoryId });
      fetchData();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
    }
  }

  const [isCatFormOpen, setIsCatFormOpen] = useState(false);
  const [isProdFormOpen, setIsProdFormOpen] = useState(false);

  const openCatForm = () => {
    setIsCatFormOpen(true);
  };

  const closeCatForm = () => {
    setIsCatFormOpen(false);
    fetchData();
  };

  const openProdForm = () => {
    setIsProdFormOpen(true);
  };

  const closeProdForm = () => {
    setIsProdFormOpen(false);
    fetchData();
  };

  return (
    <div className="complement-sidebar">
      <div className="button-container">
        <button onClick={openCatForm}>Agregar Categoría</button>
        {isCatFormOpen && (
          <CategoryForm closeCatForm={closeCatForm} />
        )}
        <button onClick={openProdForm}>Agregar Producto</button>
        {isProdFormOpen && (
          <ProductForm closeProdForm={closeProdForm} categories={categories} />
        )}
        <button onClick={removeLastItem}>Remover último ítem</button>
        <button>Botón 4</button>
        <button>Botón 5</button>
        <button>Botón 6</button>
        <button>Botón 7</button>
        <button>Botón 8</button>
        <button>Botón 9</button>
        <button>Botón 10</button>
        <button>Botón 11</button>
        <button>Botón 12</button>
        <button>Botón 13</button>
        <button onClick={() => deleteCategory(1)}>Eliminar categoría</button>
      </div>
    </div>
  );
}

export default ComplementSidebar;
