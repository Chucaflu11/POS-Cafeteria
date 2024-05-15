import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MenuOptions from './MenuOptions';
import CategoryProducts from './CategoryProducts';
import ComplementSidebar from './ComplementSidebar';

import '../styles/App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);

  const categories = [
    {
      name: 'Bebidas calientes',
      products: [
        { id: 1, name: 'Café', price: 2.5 },
        { id: 2, name: 'Té verde', price: 2.0 },
        { id: 3, name: 'Café con leche', price: 3.0 },
        { id: 4, name: 'Capuchino', price: 3.5 },
        { id: 5, name: 'Chocolate caliente', price: 3.0 },
        { id: 6, name: 'Mate', price: 2.0 }
      ],
    },
    {
      name: 'Postres',
      products: [
        { id: 7, name: 'Torta de Chocolate', price: 3.0 },
        { id: 8, name: 'Galletas de avena', price: 1.5 },
        { id: 9, name: 'Helado de vainilla', price: 3.5 },
        { id: 10, name: 'Cheesecake', price: 4.0 },
        { id: 11, name: 'Tiramisú', price: 4.5 },
        { id: 12, name: 'Flan', price: 2.5 }
      ],
    },
    {
      name: 'Bebidas frías',
      products: [
        { id: 13, name: 'Limonada', price: 2.0 },
        { id: 14, name: 'Jugo de naranja', price: 2.5 },
        { id: 15, name: 'Té helado', price: 2.0 },
        { id: 16, name: 'Smoothie de frutas', price: 4.0 },
        { id: 17, name: 'Cerveza de raíz', price: 3.0 },
        { id: 18, name: 'Refresco de cola', price: 1.5 }
      ],
    },
    {
      name: 'Sandwiches',
      products: [
        { id: 19, name: 'Sandwich de jamón y queso', price: 5.0 },
        { id: 20, name: 'Sandwich de pollo', price: 4.5 },
        { id: 21, name: 'Sandwich vegetariano', price: 4.0 },
        { id: 22, name: 'Sandwich de atún', price: 5.5 },
        { id: 23, name: 'Sandwich de pavo', price: 5.0 },
        { id: 24, name: 'Sandwich de roast beef', price: 6.0 }
      ],
    },
    {
      name: 'Ensaladas',
      products: [
        { id: 25, name: 'Ensalada César', price: 6.0 },
        { id: 26, name: 'Ensalada de quinoa', price: 7.0 },
        { id: 27, name: 'Ensalada de pollo', price: 5.5 },
        { id: 28, name: 'Ensalada griega', price: 6.5 },
        { id: 29, name: 'Ensalada caprese', price: 5.0 },
        { id: 30, name: 'Ensalada de frutas', price: 4.0 }
      ],
    },
    {
      name: 'Desayunos',
      products: [
        { id: 31, name: 'Huevos revueltos', price: 5.0 },
        { id: 32, name: 'Panqueques', price: 4.5 },
        { id: 33, name: 'Tostadas francesas', price: 4.0 },
        { id: 34, name: 'Omelette de vegetales', price: 6.0 },
        { id: 35, name: 'Avena con frutas', price: 3.5 },
        { id: 36, name: 'Batido de proteínas', price: 5.5 }
      ],
    },
    {
      name: 'Almuerzos',
      products: [
      ],
    },
    {
      name: 'Cenas',
      products: [
      ],
    },
    {
      name: 'Bebidas alcohólicas',
      products: [
      ],
    },
    {
      name: 'Snacks',
      products: [
      ],
    },
    {
      name: 'Platos principales',
      products: [
      ],
    },
    {
      name: 'Entradas',
      products: [
      ],
    },
    {
      name: 'Guarniciones',
      products: [
      ],
    },
    {
      name: 'Sopas',
      products: [
      ],
    },
    {
      name: 'Salsas',
      products: [
      ],
    },
    {
      name: 'Postres',
      products: [
      ],
    },
    {
      name: 'Desayunos',
      products: [
      ],
    },
    {
      name: 'Café',
      products: [
      ],
    },
    {
      name: 'Té',
      products: [
      ],
    },
    {
      name: 'Jugos',
      products: [
      ],
    },
    {
      name: 'Refrescos',
      products: [
      ],
    },
    {
      name: 'Cervezas',
      products: [
      ],
    },
    {
      name: 'Vinos',
      products: [
      ],
    },
    {
      name: 'Licores',
      products: [
      ],
    },
];


  return (
    <div className="app">
      <Header />
      <div className='main-content'>
        <div className="content">
          <Sidebar cart={cart} />
          <div className="content-right">
            <div className="main-buttons">
              {selectedCategory ? (
                <CategoryProducts
                  category={selectedCategory}
                  cart={cart}
                  setCart={setCart}
                />
              ) : (
                <MenuOptions
                  setSelectedCategory={setSelectedCategory}
                  categories={categories}
                />
              )}
              <ComplementSidebar cart={cart} setCart={setCart} />
            </div>
            <Footer cart={cart} setCart={setCart} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;