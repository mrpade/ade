// src/pages/Login.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [step, setStep]       = useState('login');   // 'login' ou 'forgot'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');
  const { login }             = useContext(AuthContext);
  const navigate              = useNavigate();

  // Reset form & messages à chaque changement de step
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    setInfo('');
  }, [step]);

  // 1️⃣ Connexion classique
  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token);
      navigate('/moncompte');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    }
  };

  // 2️⃣ Demande de lien de réinitialisation
  const handleForgot = async e => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      const { data } = await api.post('/auth/forgot', { email });
      setInfo(`Email envoyé ! Ouvre ce lien de preview : ${data.previewUrl}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la demande');
    }
  };

  return (
    <div className="container">
      {step === 'login' ? (
        <>
          <h1>Connexion</h1>
          <form onSubmit={handleLogin} className="auth-form">
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
          </form>
          {error && <p className="error">{error}</p>}
          <p className="auth-link">
            <a href="#" onClick={() => setStep('forgot')}>
              Mot de passe oublié ?
            </a>
          </p>
        </>
      ) : (
        <>
          <h1>Mot de passe oublié</h1>
          <form onSubmit={handleForgot} className="auth-form">
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit">Envoyer le lien</button>
          </form>
          {info && <p className="info">{info}</p>}
          {error && <p className="error">{error}</p>}
          <p className="auth-link">
            <a href="#" onClick={() => setStep('login')}>
              ← Retour à la connexion
            </a>
          </p>
        </>
      )}
    </div>
  );
}
