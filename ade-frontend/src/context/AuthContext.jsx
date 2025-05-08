// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 1. On initialise le token à partir du localStorage
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 2. Si le token change ailleurs (autre onglet), on met à jour le state
  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 3. Fonction pour se connecter : on stocke en localStorage ET dans le state
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  // 4. Fonction pour se déconnecter : on supprime le token et on remet state à null
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // 5. On expose token, login et logout à tous les enfants du provider
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
