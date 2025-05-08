// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [error, setError]               = useState('');
  const [info, setInfo]                 = useState('');
  const { token }                       = useParams();
  const navigate                        = useNavigate();

  // Clear messages when token changes
  useEffect(() => {
    setPassword('');
    setConfirm('');
    setError('');
    setInfo('');
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      const { data } = await api.post('/auth/reset', { token, password, confirmPassword: confirm });
      setInfo(data.message || 'Votre mot de passe a été réinitialisé ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de réinitialiser');
    }
  };

  return (
    <div className="container">
      <h1>Réinitialiser le mot de passe</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmer mot de passe"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <button type="submit">Valider</button>
      </form>
      {info && <p className="info">{info}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
