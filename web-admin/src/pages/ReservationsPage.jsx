import React, { useState, useEffect } from 'react';
import { getReservas, createReserva, updateReserva, deleteReserva, getUsuarios, getFunciones, getPeliculas } from '../services/api';
import './ReservationsPage.css';

function ReservationsPage() {
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    usuario: '',
    funcion: '',
    cantidad_asientos: '',
    fecha_reserva: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reservasData, usuariosData, funcionesData, peliculasData] = await Promise.all([
        getReservas(),
        getUsuarios(),
        getFunciones(),
        getPeliculas()
      ]);
      // La API devuelve {count, next, previous, results}, necesitamos solo results
      setReservas(reservasData.results || reservasData);
      setUsuarios(usuariosData.results || usuariosData);
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
    
    if (!formData.usuario || !formData.funcion || !formData.cantidad_asientos || !formData.fecha_reserva) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      setSaving(true);
      
      const reservaData = {
        usuario: parseInt(formData.usuario),
        funcion: parseInt(formData.funcion),
        cantidad_asientos: parseInt(formData.cantidad_asientos)
      };
      
      console.log('Enviando datos de reserva:', reservaData);
      
      if (editingReservation) {
        await updateReserva(editingReservation.id, reservaData);
        alert('Reserva actualizada exitosamente');
      } else {
        await createReserva(reservaData);
        alert('Reserva creada exitosamente');
      }
      
      // Recargar la lista y resetear el formulario
      loadData();
      resetForm();
    } catch (error) {
      console.error('Error al guardar reserva:', error);
      alert('Error al guardar reserva');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reserva) => {
    setEditingReservation(reserva);
    setFormData({
      usuario: reserva.usuario,
      funcion: reserva.funcion,
      cantidad_asientos: reserva.cantidad_asientos.toString(),
      fecha_reserva: reserva.fecha_reserva
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta reserva?')) {
      try {
        await deleteReserva(id);
        alert('Reserva eliminada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar reserva:', error);
        alert('Error al eliminar reserva');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      usuario: '',
      funcion: '',
      cantidad_asientos: '',
      fecha_reserva: ''
    });
    setEditingReservation(null);
    setShowForm(false);
  };

  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.nombre : 'Usuario no encontrado';
  };

  const getFuncionInfo = (funcionId) => {
    const funcion = funciones.find(f => f.id === funcionId);
    if (!funcion) {
      return {
        titulo: 'Función no encontrada',
        fecha: '-',
        hora: '-',
        sala: '-',
        precio: 0
      };
    }
    
    const pelicula = peliculas.find(p => p.id === funcion.pelicula);
    const peliculaTitulo = pelicula ? pelicula.titulo : 'Película no encontrada';
    
    try {
      const fechaObj = new Date(funcion.fecha + 'T' + funcion.hora_inicio);
      const fechaFormateada = fechaObj.toLocaleDateString('es-ES');
      const horaFormateada = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      return {
        titulo: peliculaTitulo,
        fecha: fechaFormateada,
        hora: horaFormateada,
        sala: funcion.sala || 'Sala no especificada',
        precio: funcion.precio || 0
      };
    } catch (error) {
      console.error('Error al formatear fecha de función:', error);
      return {
        titulo: peliculaTitulo,
        fecha: funcion.fecha || '-',
        hora: funcion.hora_inicio || '-',
        sala: funcion.sala || 'Sala no especificada',
        precio: funcion.precio || 0
      };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotal = (funcionId, cantidadAsientos) => {
    const funcion = funciones.find(f => f.id === funcionId);
    if (!funcion || !funcion.precio || !cantidadAsientos) return 0;
    return funcion.precio * cantidadAsientos;
  };

  if (loading) {
    return (
      <div className="reservations-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Cargando reservas...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="reservations-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Reservas</h1>
          <p>Administra las reservas de entradas de cine</p>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancelar' : 'Nueva Reserva'}
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {showForm && (
          <div className="form-section">
            <div className="form-container">
              <h2>{editingReservation ? 'Editar Reserva' : 'Crear Nueva Reserva'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="usuario">Usuario:</label>
                    <select
                      id="usuario"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleInputChange}
                      disabled={saving}
                      required
                    >
                      <option value="">Seleccione un usuario</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nombre} - {usuario.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="funcion">Función:</label>
                    <select
                      id="funcion"
                      name="funcion"
                      value={formData.funcion}
                      onChange={handleInputChange}
                      disabled={saving}
                      required
                    >
                      <option value="">Seleccione una función</option>
                      {funciones.map((funcion) => {
                        const pelicula = peliculas.find(p => p.id === funcion.pelicula);
                        const peliculaTitulo = pelicula ? pelicula.titulo : 'Película no encontrada';
                        const fechaObj = new Date(funcion.fecha + 'T' + funcion.hora_inicio);
                        const fechaFormateada = fechaObj.toLocaleDateString('es-ES');
                        const horaFormateada = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                          <option key={funcion.id} value={funcion.id}>
                            {peliculaTitulo} - {fechaFormateada} {horaFormateada} - {funcion.sala} - COP ${funcion.precio?.toLocaleString() || '0'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cantidad_asientos">Cantidad de Asientos:</label>
                    <input
                      type="number"
                      id="cantidad_asientos"
                      name="cantidad_asientos"
                      value={formData.cantidad_asientos}
                      onChange={handleInputChange}
                      placeholder="Número de asientos"
                      min="1"
                      max="10"
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fecha_reserva">Fecha de Reserva:</label>
                    <input
                      type="date"
                      id="fecha_reserva"
                      name="fecha_reserva"
                      value={formData.fecha_reserva}
                      onChange={handleInputChange}
                      disabled={saving}
                      required
                    />
                  </div>
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
                    {saving ? 'Guardando...' : (editingReservation ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="reservations-section">
          <div className="section-header">
            <h2>Lista de Reservas</h2>
            <div className="reservations-count">
              <span>Total:</span>
              <span className="count-badge">{reservas.length}</span>
            </div>
          </div>

          {reservas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎫</div>
              <h3>No hay reservas registradas</h3>
              <p>Comience agregando una nueva reserva al sistema</p>
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                Crear Primera Reserva
              </button>
            </div>
          ) : (
            <div className="reservations-grid">
              {reservas.map((reserva) => {
                const funcionInfo = getFuncionInfo(reserva.funcion);
                const total = calculateTotal(reserva.funcion, reserva.cantidad_asientos);
                
                return (
                  <div key={reserva.id} className="reservation-card">
                    <div className="reservation-header">
                      <h3>Reserva #{reserva.id}</h3>
                      <span className="reservation-date">{formatDate(reserva.fecha_reserva)}</span>
                    </div>
                    <div className="reservation-details">
                      <div className="detail-item">
                        <span className="detail-label">👤 Cliente:</span>
                        <span className="detail-value">{getUsuarioNombre(reserva.usuario)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">🎬 Película:</span>
                        <span className="detail-value">{funcionInfo.titulo}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📅 Función:</span>
                        <span className="detail-value">{funcionInfo.fecha} - {funcionInfo.hora}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">🏛️ Sala:</span>
                        <span className="detail-value">{funcionInfo.sala}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">🪑 Asientos:</span>
                        <span className="detail-value">{reserva.cantidad_asientos}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">💰 Total:</span>
                        <span className="detail-value total">COP ${(total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="reservation-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(reserva)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(reserva.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReservationsPage;
