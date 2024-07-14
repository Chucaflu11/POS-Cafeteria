import React, {useState} from 'react';
import '../styles/ComplementSidebar.css';
import CategoryForm from './CategoryForm';
import ProductForm from './ProductForm';

import { invoke } from '@tauri-apps/api/tauri';

function ComplementSidebar({ cart, setCart, fetchData, categories, selectedCategory, setIsEditing }) {

  const removeLastItem = () => {
    const newCart = [...cart];
    newCart.pop();
    setCart(newCart);
  };

  // ------------------------------------Future work----------------------------------------
  // async function deleteCategory(categoryId) {
  //   try {
  //     await invoke('delete_category', { categoryId });
  //     fetchData();
  //   } catch (error) {
  //     console.error('Error al eliminar categoría:', error);
  //   }
  // }

  const [isCatFormOpen, setIsCatFormOpen] = useState(false);
  const [isCatEditingFormOpen, setIsCatEditingFormOpen] = useState(false);
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

  const openCatFormForEditing = () => {
    setIsCatEditingFormOpen(true);
  };

  const closeCatFormForEditing = () => {
    setIsCatEditingFormOpen(false);
    fetchData();
  };

  const handleEditClick = () => {
    setIsEditing(prevIsEditing => !prevIsEditing);
  };

  return (
    <div className="complement-sidebar">
      <div className="button-container">
        <button onClick={openCatForm}>Agregar Categoría</button>
        {isCatFormOpen && (
          <CategoryForm closeCatForm={closeCatForm} isEditing={false} setIsEditing={setIsEditing} currentCategory={selectedCategory} />
        )}
        <button onClick={openProdForm}>Agregar Producto</button>
        {isProdFormOpen && (
          <ProductForm closeProdForm={closeProdForm} categories={categories} isEditing={false} setIsEditing={setIsEditing} />
        )}
        <button onClick={removeLastItem}>Remover último ítem</button>
        <button onClick={openCatFormForEditing}>Editar Categorías</button>
        {isCatEditingFormOpen && (
          <CategoryForm closeCatForm={closeCatFormForEditing} isEditing={true} setIsEditing={setIsEditing} currentCategory={selectedCategory} />
        )}
        <button onClick={handleEditClick}>Editar Productos</button>
      </div>
    </div>
  );
}

export default ComplementSidebar;
