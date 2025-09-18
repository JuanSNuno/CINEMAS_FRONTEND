// Componente de navegación principal
// Aplicando principio de Responsabilidad Única: solo maneja la navegación
import { useState } from 'react';
import './Navigation.css';

const Navigation = ({ currentPage, onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: '🏠 Inicio', icon: '🏠' },
    { id: 'movies', label: '🎬 Películas', icon: '🎬' },
    { id: 'functions', label: '🎭 Funciones', icon: '🎭' },
    { id: 'users', label: '👤 Usuarios', icon: '👤' },
    { id: 'reservations', label: '🎟️ Reservas', icon: '🎟️' },
  ];

  const handleMenuClick = (pageId) => {
    onPageChange(pageId);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="nav-logo">
          <h2>🎬 Cinema Admin</h2>
        </div>
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
        {menuItems.map((item) => (
          <li key={item.id} className="nav-item">
            <button
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
