// CategoryProducts.js
import React from 'react';

function CategoryProducts({ category, cart, setCart }) {
  // Suponiendo que products es un arreglo de objetos con información sobre los productos de la categoría seleccionada
  const products = [
    { id: 1, name: 'Café', price: 2.5 },
    { id: 2, name: 'Torta de Chocolate', price: 3.0 },
    // Otros productos...
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="category-products">
      <h2>{category}</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
            <button onClick={() => addToCart(product)}>Agregar al carrito</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryProducts;
