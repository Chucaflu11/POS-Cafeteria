// Header.jsx
import React from 'react';
import logo from '../assets/Logo_CafeteriaPNG.png';

import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <img src={logo} alt="Cafeteria Logo" className="logo" />
      <h1>Cafetería Del Ángel</h1>
    </header>
  );
}

export default Header;