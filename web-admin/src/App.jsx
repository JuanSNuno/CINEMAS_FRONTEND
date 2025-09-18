// App.jsx
// Componente principal de la aplicación con sistema de navegación
import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import UsersPage from './pages/UsersPage';
import FunctionsPage from './pages/FunctionsPage';
import ReservationsPage from './pages/ReservationsPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'movies':
        return <MoviesPage />;
      case 'users':
        return <UsersPage />;
      case 'functions':
        return <FunctionsPage />;
      case 'reservations':
        return <ReservationsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;
