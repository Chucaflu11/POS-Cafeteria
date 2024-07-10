import React, { useEffect, useRef, useState } from 'react';
import '../styles/Categories.css';

function Categories({ setSelectedCategory, categories }) {
  const [gridColumnCount, setGridColumnCount] = useState(1);
  const footerRef = useRef(null);

  useEffect(() => {
    const calculateColumns = () => {
      const containerWidth = footerRef.current.clientWidth;
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
  }, []);

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-button-container" style={{ gridTemplateColumns: `repeat(${gridColumnCount}, 1fr)` }}>
        {categories.map((category, index) => (
          <button key={index} onClick={() => setSelectedCategory(category)}>
            {category.nombre_categoria}
          </button>
        ))}
      </div>
    </footer>
  );
}

export default Categories;
