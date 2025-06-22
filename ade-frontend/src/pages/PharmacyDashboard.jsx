import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { createPharmacyProfile, toggleOnCall } from '../api/pharmacy';
import './PharmacyDashboard.css';

export default function PharmacyDashboard() {
  const { token, logout } = useContext(AuthContext);
  const [pharmacy, setPharmacy] = useState(null);
  const [form, setForm] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const { data } = await api.get('/pharmacies/me');
        setPharmacy(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setPharmacy(null);
        } else {
          console.error('Pharmacy dashboard fetch error', err);
          if (err.response?.status === 401) logout();
        }
      }
    };
    fetchData();
  }, [token, logout]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createPharmacyProfile(form);
      setPharmacy(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur création pharmacie');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnCall = async () => {
    if (!pharmacy) return;
    const newStatus = !pharmacy.is_on_call;
    try {
      await toggleOnCall(newStatus);
      setPharmacy(p => ({ ...p, is_on_call: newStatus }));
    } catch (err) {
      console.error('toggle on call error', err);
    }
  };

  if (!token) return <p>Veuillez vous connecter.</p>;

  if (!pharmacy) {
    return (
      <div className="pharmacy-dashboard">
        <form className="pharma-form" onSubmit={handleCreate}>
          <h2>Compléter votre profil pharmacie</h2>
          <input name="name" placeholder="Nom" value={form.name} onChange={handleChange} required />
          <input name="address" placeholder="Adresse" value={form.address} onChange={handleChange} required />
          <button disabled={loading}>{loading ? 'Enregistrement…' : 'Créer ma pharmacie'}</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="container" id='pharmacy-dashboard-container'>
        <aside className="profile-sidebar">
          <div className="profile-pic" />
          <h2 id='profile-name'>
            {pharmacy.name}
            <span
              className={`status-indicator ${pharmacy.is_on_call ? 'green' : 'red'}`}
            />
          </h2>
          <p>{pharmacy.address}</p>
          <button className="btn toggle" onClick={handleToggleOnCall}>
            {pharmacy.is_on_call ? 'Fin de garde' : 'Se déclarer en garde'}
          </button>
          <button id="btn-edit">Éditer mon profil</button>
          <ul className="sidebar-menu">
            <li>Commandes</li>
            <li>Stock</li>
            <li>Paramètres</li>
          </ul>
          <button className="btn-logout" onClick={logout}>Déconnexion</button>
        </aside>

        <section className="dashboard-content">
          <div className="pharmacy-dashboard-navbar"><h2>Mon Tableau de Bord</h2></div>
          <div className="section">
            <h3>Mes commandes</h3>
            <div className="empty-state">Aucune commande pour l'instant</div>
          </div>
        </section>
    </div>
  );
}
