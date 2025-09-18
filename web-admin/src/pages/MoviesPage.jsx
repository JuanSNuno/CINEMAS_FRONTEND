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
  const [formData, setFormData] = useState({ titulo: '', sinopsis: '', genero: '', duracion_minutos: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

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
      if (editingMovie) {
        // Actualizar película existente
        const response = await peliculaService.update(editingMovie.id, formData);
        setPeliculas(prev => prev.map(movie => 
          movie.id === editingMovie.id ? response.data : movie
        ));
        showNotification(`Película "${response.data.titulo}" actualizada exitosamente`, 'success');
        setEditingMovie(null);
      } else {
        // Crear nueva película
        const response = await peliculaService.create(formData);
        setPeliculas(prev => [...prev, response.data]);
        showNotification(`Película "${response.data.titulo}" creada exitosamente`, 'success');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error al guardar película:', error);
      showNotification(`Error al ${editingMovie ? 'actualizar' : 'crear'} la película`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ titulo: '', sinopsis: '', genero: '', duracion_minutos: '' });
    setShowForm(false);
    setEditingMovie(null);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      titulo: movie.titulo || '',
      sinopsis: movie.sinopsis || '',
      genero: movie.genero || '',
      duracion_minutos: movie.duracion_minutos || ''
    });
    setShowForm(true);
  };

  const handleDeleteClick = (movie) => {
    setMovieToDelete(movie);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!movieToDelete) return;

    setSubmitting(true);
    try {
      await peliculaService.delete(movieToDelete.id);
      setPeliculas(prev => prev.filter(movie => movie.id !== movieToDelete.id));
      showNotification(`Película "${movieToDelete.titulo}" eliminada exitosamente`, 'success');
      setShowDeleteConfirm(false);
      setMovieToDelete(null);
    } catch (error) {
      console.error('Error al eliminar película:', error);
      showNotification('Error al eliminar la película', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setMovieToDelete(null);
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
              <h2>{editingMovie ? '✏️ Editar Película' : '➕ Nueva Película'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="titulo">Título de la Película *:</label>
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
                
                <div className="form-group">
                  <label htmlFor="sinopsis">Sinopsis:</label>
                  <textarea
                    id="sinopsis"
                    name="sinopsis"
                    value={formData.sinopsis}
                    onChange={handleChange}
                    placeholder="Descripción de la película..."
                    rows="4"
                    disabled={submitting}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="genero">Género:</label>
                    <select
                      id="genero"
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="">Seleccionar género</option>
                      <option value="Acción">Acción</option>
                      <option value="Comedia">Comedia</option>
                      <option value="Drama">Drama</option>
                      <option value="Terror">Terror</option>
                      <option value="Ciencia Ficción">Ciencia Ficción</option>
                      <option value="Romance">Romance</option>
                      <option value="Aventura">Aventura</option>
                      <option value="Animación">Animación</option>
                      <option value="Documental">Documental</option>
                      <option value="Thriller">Thriller</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="duracion_minutos">Duración (minutos):</label>
                    <input
                      type="number"
                      id="duracion_minutos"
                      name="duracion_minutos"
                      value={formData.duracion_minutos}
                      onChange={handleChange}
                      placeholder="120"
                      min="1"
                      max="300"
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? '⏳ Guardando...' : (editingMovie ? '💾 Actualizar Película' : '💾 Crear Película')}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={resetForm}
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
                  
                  <div className="movie-details">
                    {pelicula.genero && (
                      <div className="movie-detail">
                        <span className="detail-label">🎭 Género:</span>
                        <span className="detail-value">{pelicula.genero}</span>
                      </div>
                    )}
                    
                    {pelicula.duracion_minutos && (
                      <div className="movie-detail">
                        <span className="detail-label">⏱️ Duración:</span>
                        <span className="detail-value">{pelicula.duracion_minutos} min</span>
                      </div>
                    )}
                    
                    {pelicula.sinopsis && (
                      <div className="movie-detail synopsis">
                        <span className="detail-label">📝 Sinopsis:</span>
                        <p className="detail-value">{pelicula.sinopsis}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="movie-actions">
                    <button 
                      className="btn-edit" 
                      title="Editar película"
                      onClick={() => handleEdit(pelicula)}
                      disabled={submitting}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="btn-delete" 
                      title="Eliminar película"
                      onClick={() => handleDeleteClick(pelicula)}
                      disabled={submitting}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ Confirmar Eliminación</h3>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que deseas eliminar la película?</p>
              <div className="movie-to-delete">
                <strong>"{movieToDelete?.titulo}"</strong>
              </div>
              <p className="warning-text">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-danger"
                onClick={confirmDelete}
                disabled={submitting}
              >
                {submitting ? '⏳ Eliminando...' : '🗑️ Eliminar'}
              </button>
              <button 
                className="btn-secondary"
                onClick={cancelDelete}
                disabled={submitting}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
