import React, { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/api';
import './UsersPage.css';

function UsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: ''
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      // La API devuelve {count, next, previous, results}, necesitamos solo results
      setUsuarios(data.results || data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
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
    
    if (!formData.nombre.trim() || !formData.email.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      setSaving(true);
      
      if (editingUser) {
        await updateUsuario(editingUser.usuario_id, formData);
        alert('Usuario actualizado exitosamente');
      } else {
        await createUsuario(formData);
        alert('Usuario creado exitosamente');
      }
      
      // Recargar la lista y resetear el formulario
      loadUsuarios();
      resetForm();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        await deleteUsuario(id);
        alert('Usuario eliminado exitosamente');
        loadUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Cargando usuarios...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Usuarios</h1>
          <p>Administra la información de usuarios del sistema</p>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancelar' : 'Nuevo Usuario'}
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {showForm && (
          <div className="form-section">
            <div className="form-container">
              <h2>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre Completo:</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ingrese el nombre completo"
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ingrese el email"
                    disabled={saving}
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
                    {saving ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="users-section">
          <div className="section-header">
            <h2>Lista de Usuarios</h2>
            <div className="users-count">
              <span>Total:</span>
              <span className="count-badge">{usuarios.length}</span>
            </div>
          </div>

          {usuarios.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No hay usuarios registrados</h3>
              <p>Comience agregando un nuevo usuario al sistema</p>
              <button 
                className="btn-primary"
                onClick={() => setShowForm(true)}
              >
                Crear Primer Usuario
              </button>
            </div>
          ) : (
            <div className="users-grid">
              {usuarios.map((usuario) => (
                <div key={usuario.usuario_id} className="user-card">
                  <div className="user-header">
                    <h3>{usuario.nombre}</h3>
                    <span className="user-id">ID: {usuario.usuario_id}</span>
                  </div>
                  <div className="user-details">
                    <div className="detail-item">
                      <span className="detail-label">📧 Email:</span>
                      <span className="detail-value">{usuario.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">� Registro:</span>
                      <span className="detail-value">{new Date(usuario.fecha_registro).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(usuario)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(usuario.usuario_id)}
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

export default UsersPage;
