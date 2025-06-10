// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Tes composants
import Navbar   from './components/Navbar';
import Home     from './pages/Home';
import Maladies from './pages/Maladies';
import Register from './pages/Register';
import Login from './pages/Login';
import ResetPassword   from './pages/ResetPassword.jsx';
import MonCompte from './pages/MonCompte';
import Profile         from './pages/Profile.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      {/* Barre de navigation en haut */}
      <Navbar />

      {/* Zone principale */}
      <main>
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="/maladies" element={<Maladies />} />
          <Route path="/moncompte" element={<MonCompte />} />
          <Route path="/doctor"    element={<DoctorDashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Catch-all pour URL inconnues */}
          <Route
            path="*"
            element={
              <div className="container">
                <h1>Page introuvable</h1>
                <p>Cette page n’existe pas. Retournez à <a href="/">l’accueil</a>.</p>
              </div>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

/*<Route path="/pharmacy"  element={<PharmacyDashboard />} />
          <Route path="/courier"   element={<CourierDashboard />} />
          <Route path="/moncompte" element={<PatientDashboard />} />*/