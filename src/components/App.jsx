// App.js
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MenuOptions from './MenuOptions';
import CategoryProducts from './CategoryProducts';

import '../styles/App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="app">
      <Header />
      <div className='main-content'>
        <div className="content">
          <Sidebar />
          <div className="content-right">
            {selectedCategory ? (
              <CategoryProducts
                category={selectedCategory}
              />
            ) : (
              <MenuOptions setSelectedCategory={setSelectedCategory} />
            )}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
