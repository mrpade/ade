
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';

import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. On enveloppe l'app dans AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);