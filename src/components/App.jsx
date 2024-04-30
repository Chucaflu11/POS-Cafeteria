import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MenuOptions from './MenuOptions';
import CategoryProducts from './CategoryProducts';

import '../styles/App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]); // Inicializa cart como un array vacío

  return (
    <div className="app">
      <Header />
      <div className='main-content'>
        <div className="content">
          <Sidebar cart={cart} /> {/* Pasa cart como prop a Sidebar */}
          <div className="content-right">
            {selectedCategory ? (
              <CategoryProducts
                category={selectedCategory}
                cart={cart} // Pasa cart como prop a CategoryProducts
                setCart={setCart} // Pasa setCart como prop a CategoryProducts
              />
            ) : (
              <MenuOptions setSelectedCategory={setSelectedCategory} />
            )}
            <Footer cart={cart} setCart={setCart} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;