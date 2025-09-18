// components/ReservationForm.jsx
// Componente responsable únicamente de crear reservas (SRP)
import { useState } from 'react';
import { reservaService } from '../services/api';

const ReservationForm = ({ usuarios = [], peliculas = [], onReservationCreated, showNotification }) => {
  const [formData, setFormData] = useState({
    usuario: '',
    pelicula: ''
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
    if (!formData.pelicula) {
      showNotification('Debe seleccionar una película', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await reservaService.create(formData);
      showNotification('Reserva creada correctamente', 'success');
      onReservationCreated(response.data);
      
      // Limpiar formulario después del éxito
      setFormData({ usuario: '', pelicula: '' });
    } catch (err) {
      console.error('Error creating reservation:', err);
      showNotification('Error al crear reserva', 'error');
    } finally {
      setLoading(false);
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
          <label htmlFor="pelicula">Película:</label>
          <select
            id="pelicula"
            name="pelicula"
            value={formData.pelicula}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Seleccione una película</option>
            {peliculas.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.titulo}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || usuarios.length === 0}
        >
          {loading ? 'Creando reserva...' : 'Reservar'}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;
