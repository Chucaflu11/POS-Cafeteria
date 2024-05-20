import React, { useEffect, useRef, useState } from 'react';
import '../styles/CategoryProducts.css';

function CategoryProducts({ category, cart, setCart }) {
  const [gridColumnCount, setGridColumnCount] = useState(1);
  const categoryProductsRef = useRef(null);

  useEffect(() => {
    const calculateColumns = () => {
      const containerWidth = categoryProductsRef.current.clientWidth;
      const columnWidth = 120; // Width of each button
      const minColumnCount = 1; // Minimum number of columns

      const calculatedColumnCount = Math.max(
        Math.floor(containerWidth / columnWidth),
        category.products.length,
        minColumnCount
      );

      setGridColumnCount(calculatedColumnCount);
    };

    calculateColumns();
    window.addEventListener('resize', calculateColumns);
    return () => {
      window.removeEventListener('resize', calculateColumns);
    };
  }, [category.products]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="category-products" ref={categoryProductsRef}>
      <ul className="category-products-list" style={{ gridTemplateColumns: `repeat(${gridColumnCount}, 1fr)` }}>
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
