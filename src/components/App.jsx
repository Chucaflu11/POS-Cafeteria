import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import CategoryProducts from './CategoryProducts';
import ComplementSidebar from './ComplementSidebar';

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

      // Establecer la primera categoría como seleccionada si hay datos
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
      }
      console.log("Fetched");
    } catch (error) {
      console.error('Error al obtener datos de la base de datos:', error);
      // ... (manejo de errores, mostrar mensaje al usuario, etc.)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <div className="content">
          <Sidebar cart={cart} />
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
    </div>
  );
}

export default App;