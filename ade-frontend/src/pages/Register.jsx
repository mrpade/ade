// src/pages/Register.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function Register() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    birthdate: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      // Appel à l'API d'inscription
      const { data } = await api.post('/auth/register', form);

      // Si l'API renvoie un token, on connecte directement
      if (data.token, data) {
        login(data.token, data.role);
        if (data.role === 'doctor')      navigate('/doctor');
          else if (data.role === 'pharmacy') navigate('/pharmacy');
          else if (data.role === 'courier')  navigate('/courier');
          else                               navigate('/moncompte');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur inscription');
    }
  };

  return (
    <div className="register-page">
      {/* Colonne gauche */}
      <aside className="register-page__aside">
        <h1>Bienvenue sur Ade Care</h1>
        <p>
          Créer un compte vous permet de bénéficier de toutes les fonctionnalités de notre application.
        </p>
      </aside>

      {/* Formulaire */}
      <section className="register-page__form">
        <h1>Create an account</h1>
        <p>
          Vous n’avez pas encore de compte ? Ça prend moins d’une minute. If you already have an account,{' '}
          <Link to="/login">Login</Link>.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            name="last_name"
            placeholder="Nom"
            value={form.last_name}
            onChange={handleChange}
            required
          />
          <input
            name="first_name"
            placeholder="Prénom"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="birthdate"
            placeholder="Date de naissance"
            value={form.birthdate}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Adresse email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Nouveau mot de passe"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer mot de passe"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <PasswordStrengthMeter password={form.password} />

          <button type="submit">Créer mon compte</button>
          {error && <p className="form-error">{error}</p>}
        </form>
      </section>
    </div>
  );
}
