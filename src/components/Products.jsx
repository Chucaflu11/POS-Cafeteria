import React, { useEffect, useRef, useState } from 'react';
import '../styles/CategoryProducts.css';

function Products({ products, cart, setCart }) {
  const [gridColumnCount, setGridColumnCount] = useState(1);
  const categoryProductsRef = useRef(null);

  useEffect(() => {
    const calculateColumns = () => {
      const containerWidth = categoryProductsRef.current.clientWidth;
      const columnWidth = 120; // Width of each button
      const minColumnCount = 1; // Minimum number of columns

      const calculatedColumnCount = Math.max(
        Math.floor(containerWidth / columnWidth),
        minColumnCount
      );

      setGridColumnCount(calculatedColumnCount);
    };

    calculateColumns();
    window.addEventListener('resize', calculateColumns);
    return () => {
      window.removeEventListener('resize', calculateColumns);
    };
  }, [products]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="category-products" ref={categoryProductsRef}>
      <ul className="category-products-list" style={{ gridTemplateColumns: `repeat(${gridColumnCount}, 1fr)` }}>
        {products.map((product) => (
          <li key={product.id_producto}>
            <button onClick={() => addToCart(product)}>
              {product.nombre_producto}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Products;
