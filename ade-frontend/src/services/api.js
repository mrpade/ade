// src/services/api.js
import axios from 'axios';

// Crée une instance Axios avec l’URL de base de ton API
const base = import.meta.env.VITE_API_URL || '';
const api = axios.create({
  // Use relative /api by default so dev server proxy can handle requests
  baseURL: `${base}/api`
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