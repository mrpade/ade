// src/pages/Profile.jsx
import React, { useContext, useState, useEffect, } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

export default function Profile() {
  const { token, logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const memberSince = user ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/moncompte');
        setUser(data);
      } catch (err) {
        console.error(err);
        // si 401, redirige vers login
        logout();
        navigate('/login');
      }
    };
    fetchUser();
  }, [logout, navigate]);

  if (!user) return <div>Chargement...</div>;

  return (
    <>
      <div className="profile-container">
        <aside className="sidebar">
          <div className="profile-info">
            <img
              src={user.avatarUrl || '/assets/default-profile.png'}
              alt="Photo Profil"
              className="profile-img"
            />
            <div className="name">{user.first_name} {user.last_name}</div>
            <div className="birthdate">{new Date(user.birthdate).toLocaleDateString('fr-FR')}</div>
            <button className="edit-profile">Éditer mon profil</button>
          </div>
          <nav className="menu">
            <ul>
              <li><a href="#dashboard">Tableau de bord</a></li>
              <li><a href="#info">Mes informations</a></li>
              <li><a href="#history">Mon historique</a></li>
              <li><a href="#pharmacies">Pharmacies</a></li>
              <li><a href="#purchases">Mes achats</a></li>
              <li><a href="#appointments">Rendez-vous</a></li>
              <li><a href="#records">Mon carnet</a></li>
              <li><a href="#settings">Paramètres</a></li>
            </ul>
          </nav>
          <div className="logout">
            <button onClick={() => { logout(); navigate('/login'); }} className="logout-btn">
              Se déconnecter
            </button>
          </div>
        </aside>

        <main className="main-content">
          <header className="header">
            <div className="section-title">Tableau de bord</div>
            <div className="member-since">Membre depuis : {memberSince}</div>
          </header>

          <section className="content">
            <div className="card recap">
              <h3>Récapitulatif</h3>
              <div className="grid">
                <div className="card-item">Dernière recherche</div>
                <div className="card-item">Pharmacie la plus proche</div>
                <div className="card-item">Prochain rendez-vous</div>
              </div>
            </div>
            {/* Autres sections dynamiques selon la navigation */}
          </section>
        </main>
      </div>
    </>
  );
}
