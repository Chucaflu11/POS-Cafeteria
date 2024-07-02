import React, {useState} from 'react';
import '../styles/ComplementSidebar.css';
import CategoryForm from './CategoryForm';
import ProductForm from './ProductForm';

import { invoke } from '@tauri-apps/api/tauri';

function ComplementSidebar({ cart, setCart, fetchData, categories }) {




  // Llamar a la función para agregar un cliente
async function addClient() {
  try {
    const response = await invoke('add_client', {
      nombreCliente: 'Carlos Sepúlveda'
    });
    console.log('Cliente agregado con ID:', response);
    return response;
  } catch (error) {
    console.error('Error al agregar cliente:', error);
    throw error;
  }
}

// Llamar a la función para agregar una transacción de crédito
async function addCreditTransaction() {
  try {
    const cart = [{
      id_producto: 1,  // Suponiendo que el ID del producto Sprite es 1
      nombre_producto: 'Sprite',
      id_categoria: 1,
      precio_producto: 1200
    }];

    // Obtener el ID del cliente agregado anteriormente
    const clientId = await addClient();

    const response = await invoke('add_credit_transaction', {
      cart,
      clientId
    });
    console.log('Transacción de crédito agregada correctamente:', response);
    return response;
  } catch (error) {
    console.error('Error al agregar transacción de crédito:', error);
    throw error;
  }
}

// Llamar a la función para obtener los datos fiados
async function getFiadoData() {
  try {
    const response = await invoke('get_fiado_data');
    console.log('Datos fiados obtenidos:', response);
    return response;
  } catch (error) {
    console.error('Error al obtener datos fiados:', error);
    throw error;
  }
}

// Ejecutar las funciones en secuencia
async function executeOperations() {
  try {
    await addClient();  // Agregar cliente Carlos Sepúlveda
    await addCreditTransaction();  // Agregar transacción de crédito para Sprite
    await getFiadoData();  // Obtener datos fiados e imprimirlos por consola
  } catch (error) {
    console.error('Ocurrió un error durante las operaciones:', error);
  }
}








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
        <button onClick={executeOperations} >Botón 8</button>
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
