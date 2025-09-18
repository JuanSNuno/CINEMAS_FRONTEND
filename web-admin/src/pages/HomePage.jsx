// Página principal del sistema de cines
// Aplicando principio de Cohesión: Esta página se encarga únicamente de la estructura general
import { useState, useEffect } from 'react';
import UserForm from '../components/UserForm';
import MovieList from '../components/MovieList';
import ReservationForm from '../components/ReservationForm';
import Notification from '../components/Notification';
import { usuarioService, peliculaService, reservaService, funcionService } from '../services/api';
import './HomePage.css';

const HomePage = () => {
  // Estado centralizado para toda la aplicación (Principio de Cohesión)
  const [usuarios, setUsuarios] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [loading, setLoading] = useState(true);
  
  // Estados para controlar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState({
    users: false,
    movies: true, // Cartelera expandida por defecto
    reservations: false,
    reservationsList: false
  });

  // Función para mostrar notificaciones (Principio DRY)
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Función para toggle de secciones
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Cargar películas
        const peliculasResponse = await peliculaService.getAll();
        console.log('Películas response:', peliculasResponse.data);
        const peliculasData = peliculasResponse.data.results || peliculasResponse.data;
        setPeliculas(peliculasData);
        
        // Cargar usuarios
        const usuariosResponse = await usuarioService.getAll();
        console.log('Usuarios response:', usuariosResponse.data);
        const usuariosData = usuariosResponse.data.results || usuariosResponse.data;
        setUsuarios(usuariosData);
        
        // Cargar funciones
        const funcionesResponse = await funcionService.getAll();
        console.log('Funciones response:', funcionesResponse.data);
        const funcionesData = funcionesResponse.data.results || funcionesResponse.data;
        setFunciones(funcionesData);
        
        // Cargar reservas
        const reservasResponse = await reservaService.getAll();
        console.log('Reservas response:', reservasResponse.data);
        const reservasData = reservasResponse.data.results || reservasResponse.data;
        setReservas(reservasData);
        
        showNotification('Datos cargados correctamente', 'success');
      } catch (error) {
        console.error('Error al cargar datos:', error);
        showNotification('Error al cargar los datos iniciales', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Manejar registro de nuevo usuario
  const handleUserRegistered = async (newUser) => {
    try {
      setUsuarios(prev => [...prev, newUser]);
      showNotification(`Usuario "${newUser.nombre}" registrado exitosamente`, 'success');
    } catch (error) {
      console.error('Error al actualizar usuarios:', error);
      showNotification('Error al actualizar la lista de usuarios', 'error');
    }
  };

  // Manejar nueva reserva
  const handleReservationCreated = async () => {
    try {
      // Recargar reservas para obtener datos completos
      const reservasResponse = await reservaService.getAll();
      const reservasData = reservasResponse.data.results || reservasResponse.data;
      setReservas(reservasData);
      showNotification('Reserva creada exitosamente', 'success');
      
      // Expandir automáticamente la sección de reservas para mostrar la nueva
      setExpandedSections(prev => ({ ...prev, reservationsList: true }));
    } catch (error) {
      console.error('Error al actualizar reservas:', error);
      showNotification('Error al actualizar las reservas', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Notificaciones */}
      <Notification 
        notification={notification}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
      
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <h1>🎬 Sistema de Reservas de Cine</h1>
          <p>Gestión completa de usuarios, películas y reservas</p>
          <div className="stats">
            <div className="stat">
              <span className="stat-number">{peliculas.length}</span>
              <span className="stat-label">Películas</span>
            </div>
            <div className="stat">
              <span className="stat-number">{usuarios.length}</span>
              <span className="stat-label">Usuarios</span>
            </div>
            <div className="stat">
              <span className="stat-number">{reservas.length}</span>
              <span className="stat-label">Reservas</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="main-content">
        {/* Sección de registro de usuarios */}
        <section className="collapsible-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('users')}
          >
            <h2>👤 Registro de Usuarios</h2>
            <span className={`toggle-icon ${expandedSections.users ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.users && (
            <div className="section-content">
              <UserForm 
                onUserRegistered={handleUserRegistered}
                showNotification={showNotification}
              />
            </div>
          )}
        </section>

        {/* Sección de cartelera */}
        <section className="collapsible-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('movies')}
          >
            <h2>🎬 Cartelera</h2>
            <span className={`toggle-icon ${expandedSections.movies ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.movies && (
            <div className="section-content">
              <MovieList movies={peliculas} />
            </div>
          )}
        </section>

        {/* Sección de reservas */}
        <section className="collapsible-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('reservations')}
          >
            <h2>🎟️ Crear Reserva</h2>
            <span className={`toggle-icon ${expandedSections.reservations ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.reservations && (
            <div className="section-content">
              <ReservationForm 
                usuarios={usuarios}
                peliculas={peliculas}
                funciones={funciones}
                onReservationCreated={handleReservationCreated}
                showNotification={showNotification}
              />
            </div>
          )}
        </section>

        {/* Sección de reservas existentes */}
        <section className="collapsible-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('reservationsList')}
          >
            <h2>📋 Reservas Realizadas</h2>
            <span className={`toggle-icon ${expandedSections.reservationsList ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.reservationsList && (
            <div className="section-content">
              <div className="reservations-list">
                {reservas.length === 0 ? (
                  <p className="no-data">No hay reservas registradas</p>
                ) : (
                  <div className="reservations-grid">
                    {reservas.map((reserva) => (
                      <div key={reserva.id} className="reservation-card">
                        <h3>{reserva.usuario}</h3>
                        <p><strong>Película:</strong> {reserva.funcion?.pelicula_titulo || 'No disponible'}</p>
                        <p><strong>Sala:</strong> {reserva.funcion?.sala || 'No disponible'}</p>
                        <p><strong>Función:</strong> {reserva.funcion?.fecha_hora ? new Date(reserva.funcion.fecha_hora).toLocaleString() : 'No disponible'}</p>
                        <p><strong>Asientos:</strong> {reserva.cantidad_asientos}</p>
                        <p><strong>Fecha Reserva:</strong> {new Date(reserva.fecha_reserva).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="page-footer">
        <p>&copy; 2025 Sistema de Cines - Desarrollado siguiendo principios SOLID</p>
      </footer>
    </div>
  );
};

export default HomePage;
