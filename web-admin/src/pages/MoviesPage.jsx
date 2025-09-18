// Página dedicada a la gestión de películas
// Aplicando principio de Responsabilidad Única
import { useState, useEffect } from 'react';
import { peliculaService } from '../services/api';
import Notification from '../components/Notification';
import './MoviesPage.css';

const MoviesPage = () => {
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ titulo: '' });
  const [submitting, setSubmitting] = useState(false);

  // Función para mostrar notificaciones (Principio DRY)
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Cargar películas al montar el componente
  useEffect(() => {
    const loadPeliculas = async () => {
      try {
        setLoading(true);
        const response = await peliculaService.getAll();
        const data = response.data.results || response.data;
        setPeliculas(data);
        showNotification('Películas cargadas correctamente', 'success');
      } catch (error) {
        console.error('Error al cargar películas:', error);
        showNotification('Error al cargar las películas', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadPeliculas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      showNotification('El título es requerido', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await peliculaService.create(formData);
      setPeliculas(prev => [...prev, response.data]);
      setFormData({ titulo: '' });
      setShowForm(false);
      showNotification(`Película "${response.data.titulo}" creada exitosamente`, 'success');
    } catch (error) {
      console.error('Error al crear película:', error);
      showNotification('Error al crear la película', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="movies-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando películas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="movies-page">
      <Notification 
        notification={notification}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
      
      <header className="page-header">
        <div className="header-content">
          <h1>🎬 Gestión de Películas</h1>
          <p>Administra el catálogo de películas del cine</p>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '❌ Cancelar' : '➕ Agregar Película'}
            </button>
          </div>
        </div>
      </header>

      <main className="page-content">
        {/* Formulario para agregar película */}
        {showForm && (
          <section className="form-section">
            <div className="form-container">
              <h2>➕ Nueva Película</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="titulo">Título de la Película:</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Matrix Resurrections"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? '⏳ Creando...' : '💾 Crear Película'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowForm(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Lista de películas */}
        <section className="movies-section">
          <div className="section-header">
            <h2>📽️ Catálogo de Películas</h2>
            <div className="movies-count">
              <span className="count-badge">{peliculas.length}</span>
              <span>Películas registradas</span>
            </div>
          </div>

          {peliculas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <h3>No hay películas registradas</h3>
              <p>Comienza agregando tu primera película al catálogo</p>
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                ➕ Agregar Primera Película
              </button>
            </div>
          ) : (
            <div className="movies-grid">
              {peliculas.map((pelicula) => (
                <div key={pelicula.id} className="movie-card">
                  <div className="movie-header">
                    <h3>{pelicula.titulo}</h3>
                    <span className="movie-id">ID: {pelicula.id}</span>
                  </div>
                  <div className="movie-actions">
                    <button className="btn-edit" title="Editar película">
                      ✏️ Editar
                    </button>
                    <button className="btn-delete" title="Eliminar película">
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MoviesPage;
