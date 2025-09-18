import React, { useState, useEffect } from 'react';
import { getFunciones, createFuncion, updateFuncion, deleteFuncion, getPeliculas } from '../services/api';
import './FunctionsPage.css';

function FunctionsPage() {
  const [funciones, setFunciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFunction, setEditingFunction] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pelicula: '',
    fecha_hora: '',
    sala: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [funcionesData, peliculasData] = await Promise.all([
        getFunciones(),
        getPeliculas()
      ]);
      // La API devuelve {count, next, previous, results}, necesitamos solo results
      setFunciones(funcionesData.results || funcionesData);
      setPeliculas(peliculasData.results || peliculasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.pelicula || !formData.fecha_hora || !formData.sala) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      setSaving(true);
      
      const funcionData = {
        ...formData,
        // Convertir al formato ISO que espera Django
        fecha_hora: new Date(formData.fecha_hora).toISOString()
      };
      
      if (editingFunction) {
        await updateFuncion(editingFunction.funcion_id, funcionData);
        alert('Función actualizada exitosamente');
      } else {
        await createFuncion(funcionData);
        alert('Función creada exitosamente');
      }
      
      // Recargar la lista y resetear el formulario
      loadData();
      resetForm();
    } catch (error) {
      console.error('Error al guardar función:', error);
      alert('Error al guardar función');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (funcion) => {
    setEditingFunction(funcion);
    // Convertir fecha_hora al formato datetime-local (YYYY-MM-DDTHH:MM)
    const fechaHora = new Date(funcion.fecha_hora);
    const year = fechaHora.getFullYear();
    const month = String(fechaHora.getMonth() + 1).padStart(2, '0');
    const day = String(fechaHora.getDate()).padStart(2, '0');
    const hours = String(fechaHora.getHours()).padStart(2, '0');
    const minutes = String(fechaHora.getMinutes()).padStart(2, '0');
    const fechaHoraLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setFormData({
      pelicula: funcion.pelicula,
      fecha_hora: fechaHoraLocal,
      sala: funcion.sala
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta función?')) {
      try {
        await deleteFuncion(id);
        alert('Función eliminada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar función:', error);
        alert('Error al eliminar función');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      pelicula: '',
      fecha_hora: '',
      sala: ''
    });
    setEditingFunction(null);
    setShowForm(false);
  };

  const formatDateTime = (fechaHora) => {
    const fechaObj = new Date(fechaHora);
    return fechaObj.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPeliculaTitulo = (peliculaId) => {
    const pelicula = peliculas.find(p => p.pelicula_id === peliculaId);
    return pelicula ? pelicula.titulo : 'Película no encontrada';
  };

  if (loading) {
    return (
      <div className="functions-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Cargando funciones...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="functions-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Funciones</h1>
          <p>Administra las funciones y horarios de las películas</p>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancelar' : 'Nueva Función'}
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {showForm && (
          <div className="form-section">
            <div className="form-container">
              <h2>{editingFunction ? 'Editar Función' : 'Crear Nueva Función'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pelicula">Película:</label>
                    <select
                      id="pelicula"
                      name="pelicula"
                      value={formData.pelicula}
                      onChange={handleInputChange}
                      disabled={saving}
                      required
                    >
                      <option value="">Seleccione una película</option>
                      {peliculas.map((pelicula) => (
                        <option key={pelicula.pelicula_id} value={pelicula.pelicula_id}>
                          {pelicula.titulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="sala">Sala:</label>
                    <input
                      type="text"
                      id="sala"
                      name="sala"
                      value={formData.sala}
                      onChange={handleInputChange}
                      placeholder="Ej: Sala 1, Sala VIP, etc."
                      disabled={saving}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="fecha_hora">Fecha y Hora:</label>
                  <input
                    type="datetime-local"
                    id="fecha_hora"
                    name="fecha_hora"
                    value={formData.fecha_hora}
                    onChange={handleInputChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : (editingFunction ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="functions-section">
          <div className="section-header">
            <h2>Lista de Funciones</h2>
            <div className="functions-count">
              <span>Total:</span>
              <span className="count-badge">{funciones.length}</span>
            </div>
          </div>

          {funciones.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <h3>No hay funciones programadas</h3>
              <p>Comience agregando una nueva función al sistema</p>
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                Crear Primera Función
              </button>
            </div>
          ) : (
            <div className="functions-grid">
              {funciones.map((funcion) => (
                <div key={funcion.funcion_id} className="function-card">
                  <div className="function-header">
                    <h3>{getPeliculaTitulo(funcion.pelicula)}</h3>
                    <span className="function-id">ID: {funcion.funcion_id}</span>
                  </div>
                  <div className="function-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Fecha y Hora:</span>
                      <span className="detail-value">{formatDateTime(funcion.fecha_hora)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">🏛️ Sala:</span>
                      <span className="detail-value">{funcion.sala}</span>
                    </div>
                  </div>
                  <div className="function-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(funcion)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(funcion.funcion_id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FunctionsPage;
