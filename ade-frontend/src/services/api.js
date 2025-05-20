// src/services/api.js
import axios from 'axios';

// Crée une instance Axios avec l’URL de base de ton API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

// Interceptor pour ajouter automatiquement le token JWT à chaque requête
api.interceptors.request.use(config => {
  // Récupère le token stocké (après un login réussi)
  const token = localStorage.getItem('token');
  if (token) {
    // Ajoute l’en-tête Authorization : Bearer <token>
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
