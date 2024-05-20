import React, { useEffect, useRef, useState } from 'react';
import '../styles/MenuOptions.css';

function MenuOptions({ setSelectedCategory, categories }) {
  const [gridColumnCount, setGridColumnCount] = useState(1);
  const menuOptionsRef = useRef(null);

  useEffect(() => {
    const calculateColumns = () => {
      const containerWidth = menuOptionsRef.current.clientWidth;
      const columnWidth = 120; // Width of each button including grid gap
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
    <div className="menu-options" ref={menuOptionsRef}>
      <ul className="menu-options-list" style={{ gridTemplateColumns: `repeat(${gridColumnCount}, 1fr)` }}>
        {categories.map((category, index) => (
          <li key={index}>
            <button onClick={() => setSelectedCategory(category)}>
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MenuOptions;