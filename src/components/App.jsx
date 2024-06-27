import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import CategoryProducts from './CategoryProducts';
import ComplementSidebar from './ComplementSidebar';

import Dashboard from './Dashboard/Dashboard';

import { invoke } from '@tauri-apps/api/tauri';

import '../styles/App.css'

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);


  async function fetchData() {
    try {
      const categoriesData = await invoke('get_categories');
      setCategories(categoriesData);

      const productsData = await invoke('get_products');
      setProducts(productsData);

      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
      }
    } catch (error) {
      console.error('Error al obtener datos de la base de datos:', error);
      // ... (manejo de errores, mostrar mensaje al usuario, etc.)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={
            <div className="main-content">
              <div className="content">
                <Sidebar cart={cart} setCart={setCart} />
                <div className="content-right">
                  <div className="main-buttons">
                    {selectedCategory && (
                      <CategoryProducts
                        products={products.filter(
                          (product) => product.id_categoria === selectedCategory.id_categoria
                        )}
                        cart={cart}
                        setCart={setCart}
                      />
                    )}
                  </div>
                  <ComplementSidebar
                    cart={cart}
                    setCart={setCart}
                    setSelectedCategory={setSelectedCategory}
                    fetchData={fetchData}
                    categories={categories}
                  />
                  <Footer categories={categories} setSelectedCategory={setSelectedCategory} />
                </div>
              </div>
            </div>
          }/>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;