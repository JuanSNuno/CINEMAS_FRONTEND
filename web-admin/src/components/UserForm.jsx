// components/UserForm.jsx
// Componente responsable únicamente del registro de usuarios (SRP - Single Responsibility)
import { useState } from 'react';
import { usuarioService } from '../services/api';

const UserForm = ({ onUserRegistered, showNotification }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  // Manejo del cambio en los inputs (DRY)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validación simple del formulario (KISS - Keep It Simple)
  const validateForm = () => {
    if (!formData.nombre.trim()) {
      showNotification('El nombre es requerido', 'error');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      showNotification('Email válido es requerido', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Agregar la fecha de registro actual en formato ISO
      const userData = {
        ...formData,
        fecha_registro: new Date().toISOString()
      };
      
      console.log('Enviando datos del usuario:', userData); // Para debugging
      
      const response = await usuarioService.create(userData);
      showNotification('Usuario registrado con éxito', 'success');
      onUserRegistered(response.data);
      
      // Limpiar formulario después del éxito
      setFormData({ nombre: '', email: '' });
    } catch (err) {
      console.error('Error registering user:', err);
      showNotification('Error al registrar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Usuario'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;
