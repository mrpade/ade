// src/pages/MonCompte.jsx
import { useState, useEffect, } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MonCompte() {
  const [user, setUser]   = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/moncompte')
      .then(({ data }) => setUser(data))
      .catch(err => {
        console.error(err);
        setError('Impossible de charger vos informations.');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!user) return <p>Chargement de votre profil…</p>;

  return (
    <div className="container">
      <h1>Mon compte</h1>
      <p>
       <strong>Nom :</strong>{' '}
       {user.first_name || user.last_name
         ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
         : '—'}
     </p>
      <p><strong>Email :</strong> {user.email}</p>
      <p>
       <strong>Membre depuis :</strong>{' '}
       {user.createdAt
         ? new Date(user.createdAt).toLocaleDateString()
         : '—'}
     </p>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
}
