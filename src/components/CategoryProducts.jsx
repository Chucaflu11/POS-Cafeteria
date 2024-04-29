import React from 'react';
import '../styles/CategoryProducts.css';

function CategoryProducts({ cart, setCart }) {
  const sampleProducts = [
    { id: 1, name: 'Café', price: 2.5 },
    { id: 2, name: 'Torta de Chocolate', price: 3.0 },
    { id: 3, name: 'Té verde', price: 2.0 },
    { id: 4, name: 'Jugo de naranja', price: 2.0 },
    { id: 5, name: 'Café con leche', price: 3.0 },
    { id: 6, name: 'Galletas de avena', price: 1.5 },
    { id: 7, name: 'Agua mineral', price: 1.0 },
    { id: 8, name: 'Helado de vainilla', price: 3.5 },
    { id: 9, name: 'Sándwich de pollo', price: 5.0 },
    { id: 10, name: 'Pizza Margarita', price: 8.0 },
    // Agrega más productos según sea necesario
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="category-products">
      <ul>
        {sampleProducts.map((product) => (
          <li key={product.id}>
            <button onClick={() => addToCart(product)}>
              {product.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryProducts;
