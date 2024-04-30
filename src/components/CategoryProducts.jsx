import React from 'react';
import '../styles/CategoryProducts.css';

function CategoryProducts({ category, cart, setCart }) {

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="category-products">
      <ul>
        {category.products.map((product) => (
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
