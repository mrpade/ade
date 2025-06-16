// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 1. On initialise le token à partir du localStorage
  const [token, setToken] = useState(localStorage.getItem('token'));
  // 1.2 On initialise le role à partir du localStorage
  const [role, setRole] = useState(localStorage.getItem('role'));
  // 2. Si le token change ailleurs (autre onglet), on met à jour le state
  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 2.1 Met à jour l'en-tête Authorization de l'instance Axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  // 3. Fonction pour se connecter : on stocke en localStorage ET dans le state
  const login = (newToken, newRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setRole(newRole);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  };

  // 4. Fonction pour se déconnecter : on supprime le token et on remet state à null
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    delete api.defaults.headers.common.Authorization;
  };

  // 5. On expose token, login et logout à tous les enfants du provider
  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
