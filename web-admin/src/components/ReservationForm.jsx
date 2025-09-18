// components/ReservationForm.jsx
// Componente responsable únicamente de crear reservas (SRP)
import { useState } from 'react';
import { reservaService } from '../services/api';

const ReservationForm = ({ usuarios = [], peliculas = [], funciones = [], onReservationCreated, showNotification }) => {
  const [formData, setFormData] = useState({
    usuario: '',
    funcion: '',
    cantidad_asientos: '',
    fecha_reserva: new Date().toISOString().split('T')[0] // Fecha actual por defecto
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.usuario) {
      showNotification('Debe seleccionar un usuario', 'error');
      return false;
    }
    if (!formData.funcion) {
      showNotification('Debe seleccionar una función', 'error');
      return false;
    }
    if (!formData.cantidad_asientos || formData.cantidad_asientos <= 0) {
      showNotification('Debe especificar una cantidad válida de asientos', 'error');
      return false;
    }
    if (!formData.fecha_reserva) {
      showNotification('Debe seleccionar una fecha de reserva', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const reservaData = {
        usuario: parseInt(formData.usuario),
        funcion: parseInt(formData.funcion), 
        cantidad_asientos: parseInt(formData.cantidad_asientos)
      };
      
      console.log('Enviando datos de reserva desde ReservationForm:', reservaData);
      
      const response = await reservaService.create(reservaData);
      showNotification('Reserva creada correctamente', 'success');
      onReservationCreated(response.data);
      
      // Limpiar formulario después del éxito
      setFormData({ 
        usuario: '', 
        funcion: '', 
        cantidad_asientos: '',
        fecha_reserva: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error creating reservation:', err);
      showNotification('Error al crear reserva', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatFuncionDisplay = (funcion) => {
    const pelicula = peliculas.find(p => p.id === funcion.pelicula);
    const peliculaTitulo = pelicula ? pelicula.titulo : 'Película no encontrada';
    
    try {
      const fechaObj = new Date(funcion.fecha + 'T' + funcion.hora_inicio);
      const fechaFormateada = fechaObj.toLocaleDateString('es-ES');
      const horaFormateada = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      return `${peliculaTitulo} - ${fechaFormateada} ${horaFormateada} - ${funcion.sala} - COP $${funcion.precio?.toLocaleString() || '0'}`;
    } catch {
      return `${peliculaTitulo} - ${funcion.fecha || 'Fecha no disponible'} - ${funcion.sala || 'Sala no disponible'}`;
    }
  };

  return (
    <div className="reservation-form">
      <h2>🎟️ Crear Reserva</h2>
      
      {usuarios.length === 0 && (
        <div className="warning">
          <p>No hay usuarios registrados. Registre un usuario primero.</p>
        </div>
      )}
      
      {funciones.length === 0 && (
        <div className="warning">
          <p>No hay funciones disponibles. Cree una función primero.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="usuario">Usuario:</label>
          <select
            id="usuario"
            name="usuario"
            value={formData.usuario}
            onChange={handleChange}
            required
            disabled={loading || usuarios.length === 0}
          >
            <option value="">Seleccione un usuario</option>
            {usuarios.map((user) => (
              <option key={user.id} value={user.id}>
                {user.nombre} ({user.email})
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
            onChange={handleChange}
            required
            disabled={loading || funciones.length === 0}
          >
            <option value="">Seleccione una función</option>
            {funciones.map((funcion) => (
              <option key={funcion.id} value={funcion.id}>
                {formatFuncionDisplay(funcion)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="cantidad_asientos">Cantidad de Asientos:</label>
          <input
            type="number"
            id="cantidad_asientos"
            name="cantidad_asientos"
            value={formData.cantidad_asientos}
            onChange={handleChange}
            placeholder="Número de asientos"
            min="1"
            max="10"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fecha_reserva">Fecha de Reserva:</label>
          <input
            type="date"
            id="fecha_reserva"
            name="fecha_reserva"
            value={formData.fecha_reserva}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || usuarios.length === 0 || funciones.length === 0}
        >
          {loading ? 'Creando reserva...' : 'Reservar'}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;
