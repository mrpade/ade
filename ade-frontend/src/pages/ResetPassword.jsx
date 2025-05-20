// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function ResetPassword() {
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState('');
  const [info, setInfo]           = useState('');
  const [loading, setLoading]     = useState(false);
  const { token }                 = useParams();
  const navigate                  = useNavigate();

  useEffect(() => {
    setPassword('');
    setConfirm('');
    setError('');
    setInfo('');
    setLoading(false);
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset', { token, password, confirmPassword: confirm });
      setInfo(data.message || 'Mot de passe réinitialisé !');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de réinitialiser');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container">
      <h1>Réinitialiser le mot de passe</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <PasswordStrengthMeter password={password} />
        <input
          type="password"
          placeholder="Confirmer mot de passe"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        {!loading && <button type="submit">Valider</button>}
        {loading && <span className="spinner" />}
      </form>
      {info && <p className="info">{info}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}