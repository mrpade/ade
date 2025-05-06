// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Stocke le token dans localStorage
      localStorage.setItem('token', data.token);
      // Redirige vers la page d’accueil ou espace perso
      navigate('/moncompte');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erreur connexion');
    }
  };

  return (
    <div className="container">
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
