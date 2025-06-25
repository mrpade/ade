import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [step, setStep]       = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useContext(AuthContext);
  const navigate              = useNavigate();

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    setInfo('');
    setLoading(false);
  }, [step]);

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.role);
      setEmail('');
      setPassword('');
      if (data.role === 'admin')         navigate('/admin');
        else if (data.role === 'doctor')      navigate('/doctor');
        else if (data.role === 'pharmacy')    navigate('/pharmacy');
        else if (data.role === 'courier')     navigate('/courier');
        else                                  navigate('/patient'); // patient par défaut
    } catch (err) {
      console.error('Erreur login:', err);
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async e => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot', { email });
      setInfo(`Email envoyé ! Ouvre ce lien de preview : ${data.previewUrl}`);
      setEmail('');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container">
      {step === 'login' ? (
        <>
          <h1>Connexion</h1>
          <form onSubmit={handleLogin} className="auth-form" autoComplete="off">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="off"
              required
            />
            {!loading && <button type="submit">Se connecter</button>}
            {loading && <span className="spinner" />}          
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
          <form onSubmit={handleForgot} className="auth-form" autoComplete="off">
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
            {!loading && <button type="submit">Envoyer le lien</button>}
            {loading && <span className="spinner" />}
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