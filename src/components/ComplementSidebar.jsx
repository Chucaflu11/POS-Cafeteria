import React, {useState} from 'react';
import '../styles/ComplementSidebar.css';
import CategoryForm from './CategoryForm';
import ProductForm from './ProductForm';
import PaymentModal from './PaymentModal';
import { invoke } from '@tauri-apps/api';

function ComplementSidebar({ cart, setCart, fetchData, categories }) {
  const removeLastItem = () => {
    const newCart = [...cart];
    newCart.pop();
    setCart(newCart);
  };

  const getChecks = () => {
    const checks = invoke('get_checks');
    console.log(checks);
  };

  const [isCatFormOpen, setIsCatFormOpen] = useState(false);
  const [isProdFormOpen, setIsProdFormOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

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

  const openPayment = () => {
    setIsPaymentOpen(true);
  };

  const closePayment = () => {
    setIsPaymentOpen(false);
  };

  return (
    <div className="ComplementSidebar">
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
        <button onClick={getChecks}>Debug (console.log)</button>
        <button onClick={openPayment} style={{backgroundColor:"#6d2d21"}}>Pagar</button>
        {isPaymentOpen && (
          <PaymentModal cart={cart} setCart={setCart} closePayment={closePayment}  />
          )}
      </div>
    </div>
  );
}

export default ComplementSidebar;
