import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Categories from './Categories';
import Products from './Products';
import ComplementSidebar from './ComplementSidebar';

import Dashboard from './Dashboard/Dashboard';

import Clientes from './fiados/Clientes';

import Report from './Reports/Report';

import Tables from './tables/tables';

import { invoke } from '@tauri-apps/api/tauri';

import '../styles/App.css'

function App() {
  const [theme, setTheme] = useState('light-theme');

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light-theme' ? 'dark-theme' : 'light-theme');
  };

  const setupTables = async () => {
    try {
      for (let i = 0; i < 10; i++) {
        await invoke('add_table', { nombreMesa: 'Mesa ' + (i + 1) });
      }
    } catch (error) {
      return;
    }
  };

  async function fetchData() {
    try {
      const categoriesData = await invoke('get_categories');
      setCategories(categoriesData);

      const productsData = await invoke('get_products');
      setProducts(productsData);

      setupTables();

      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
      }
    } catch (error) {
      console.error('Error al obtener datos de la base de datos:', error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Router>
      <div className={`app ${theme}`}>
        <Header toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={
            <div className="main-content">
              <div className="content">
                <Sidebar cart={cart} setCart={setCart} />
                <div className="content-right">
                  <div className="products-menu">
                    <div className="main-buttons">
                      {selectedCategory && (
                        <Products
                          products={products.filter(
                            (product) => product.id_categoria === selectedCategory.id_categoria
                          )}
                          cart={cart}
                          setCart={setCart}
                          isEditing={isEditing}
                          setIsEditing={setIsEditing}
                          categories={categories}
                          fetchData={fetchData}
                        />
                      )}
                    </div>
                    <Categories categories={categories} setSelectedCategory={setSelectedCategory} />
                  </div>
                  <ComplementSidebar
                    cart={cart}
                    setCart={setCart}
                    setSelectedCategory={setSelectedCategory}
                    fetchData={fetchData}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setIsEditing={setIsEditing}
                  />
                </div>
              </div>
            </div>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clientes />} />
          <Route path="/report" element={<Report />} />
          <Route path="/tables" element={<Tables />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;