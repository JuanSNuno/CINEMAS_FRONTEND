// services/api.js
// Configuración centralizada de la API siguiendo el principio DRY
import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo centralizado de errores (DRY)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Servicios específicos para cada entidad (SoC - Separación de Responsabilidades)

// Servicio de Usuarios
export const usuarioService = {
  getAll: () => api.get('/usuarios/'),
  create: (userData) => api.post('/usuarios/', userData),
  getById: (id) => api.get(`/usuarios/${id}/`),
  update: (id, userData) => api.put(`/usuarios/${id}/`, userData),
  delete: (id) => api.delete(`/usuarios/${id}/`),
};

// Servicio de Películas
export const peliculaService = {
  getAll: () => api.get('/peliculas/'),
  create: (peliculaData) => api.post('/peliculas/', peliculaData),
  getById: (id) => api.get(`/peliculas/${id}/`),
  update: (id, peliculaData) => api.put(`/peliculas/${id}/`, peliculaData),
  delete: (id) => api.delete(`/peliculas/${id}/`),
};

// Servicio de Funciones
export const funcionService = {
  getAll: () => api.get('/funciones/'),
  create: (funcionData) => api.post('/funciones/', funcionData),
  getById: (id) => api.get(`/funciones/${id}/`),
  update: (id, funcionData) => api.put(`/funciones/${id}/`, funcionData),
  delete: (id) => api.delete(`/funciones/${id}/`),
};

// Servicio de Reservas
export const reservaService = {
  getAll: () => api.get('/reservas/'),
  create: (reservaData) => api.post('/reservas/', reservaData),
  getById: (id) => api.get(`/reservas/${id}/`),
  update: (id, reservaData) => api.put(`/reservas/${id}/`, reservaData),
  delete: (id) => api.delete(`/reservas/${id}/`),
};

// Funciones de conveniencia para mantener compatibilidad con componentes existentes
export const getPeliculas = () => peliculaService.getAll().then(response => response.data);
export const createPelicula = (data) => peliculaService.create(data).then(response => response.data);
export const updatePelicula = (id, data) => peliculaService.update(id, data).then(response => response.data);
export const deletePelicula = (id) => peliculaService.delete(id);

export const getUsuarios = () => usuarioService.getAll().then(response => response.data);
export const createUsuario = (data) => usuarioService.create(data).then(response => response.data);
export const updateUsuario = (id, data) => usuarioService.update(id, data).then(response => response.data);
export const deleteUsuario = (id) => usuarioService.delete(id);

export const getFunciones = () => funcionService.getAll().then(response => response.data);
export const createFuncion = (data) => funcionService.create(data).then(response => response.data);
export const updateFuncion = (id, data) => funcionService.update(id, data).then(response => response.data);
export const deleteFuncion = (id) => funcionService.delete(id);

export const getReservas = () => reservaService.getAll().then(response => response.data);
export const createReserva = (data) => reservaService.create(data).then(response => response.data);
export const updateReserva = (id, data) => reservaService.update(id, data).then(response => response.data);
export const deleteReserva = (id) => reservaService.delete(id);

export default api;
