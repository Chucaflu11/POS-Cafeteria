import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MenuOptions from './MenuOptions';
import CategoryProducts from './CategoryProducts';
import ComplementSidebar from './ComplementSidebar';

import { invoke } from '@tauri-apps/api/tauri';

import '../styles/App.css'

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Inicialmente nulo
  const [cart, setCart] = useState([]);

  useEffect(() => {
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
      } catch (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        // ... (manejo de errores, mostrar mensaje al usuario, etc.)
      }
    }

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
              {selectedCategory && ( // Renderizar solo si selectedCategory no es nulo
                <CategoryProducts
                  category={selectedCategory}
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
            />
            <Footer categories={categories} setSelectedCategory={setSelectedCategory} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;