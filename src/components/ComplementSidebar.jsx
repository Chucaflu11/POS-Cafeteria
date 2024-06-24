import React, {useState} from 'react';
import FormularioCategoria from './CategoryForm';
import '../styles/ComplementSidebar.css';
import CategoryForm from './CategoryForm';

function ComplementSidebar({ cart, setCart, fetchData }) {
  const removeLastItem = () => {
    const newCart = [...cart];
    newCart.pop();
    setCart(newCart);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div className="ComplementSidebar">
      <div className="button-container">
        <button onClick={removeLastItem}>Remover último ítem</button>
        <button onClick={openModal}>Agregar Categoría</button>
        {isModalOpen && (
          <CategoryForm closeModal={closeModal} />
        )}
        <button>Botón 3</button>
        <button>Botón 4</button>
        <button>Botón 5</button>
        <button>Botón 6</button>
      </div>
    </div>
  );
}

export default ComplementSidebar;
