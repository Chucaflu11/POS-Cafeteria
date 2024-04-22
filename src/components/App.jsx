// App.js
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MenuOptions from './MenuOptions';
import CategoryProducts from './CategoryProducts';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);

  return (
    <div className="app">
      <Header />
      <div className="content">
        <Sidebar cart={cart} />
        {selectedCategory ? (
          <CategoryProducts
            category={selectedCategory}
            cart={cart}
            setCart={setCart}
          />
        ) : (
          <MenuOptions setSelectedCategory={setSelectedCategory} />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;