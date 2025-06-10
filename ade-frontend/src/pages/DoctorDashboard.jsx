import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { createDoctorProfile, toggleAvailability } from '../api/doctors';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const { token, _logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null); // doctor row
  const [form, setForm] = useState({ speciality: '', onmc: '', workplace: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('🔍 Requête GET /api/doctors/me avec token:', token);
        const { data } = await api.get('/doctors/me', { headers: { Authorization: `Bearer ${token}` } });
        setProfile(data); // if 404, will throw and go to catch
      } catch (err) {
        console.error('❌ fetchProfile error:', err.response?.status, err.response?.data, err);
        setProfile(null);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createDoctorProfile(form);
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur création profil');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async e => {
    const flag = e.target.checked;
    try {
      await toggleAvailability(flag);
      setProfile(p => ({ ...p, is_available: flag }));
    } catch {/* ignore */}
  };

  if (!token) return <p>Veuillez vous connecter.</p>;

  return (
    <div className="doc-dashboard">
      <h1>Tableau de bord Médecin</h1>

      {/* Profil inexistant → formulaire */}
      {!profile && (
        <form className="doc-form" onSubmit={handleCreate}>
          <h2>Compléter votre profil</h2>
          <input name="speciality" placeholder="Spécialité" value={form.speciality} onChange={handleChange} required />
          <input name="onmc" placeholder="Numéro ONMC" value={form.onmc} onChange={handleChange} required />
          <input name="workplace" placeholder="Lieu d'exercice" value={form.workplace} onChange={handleChange} />
          <textarea name="bio" placeholder="Présentation" value={form.bio} onChange={handleChange} />
          <button disabled={loading}>{loading ? 'Enregistrement…' : 'Créer mon profil'}</button>
          {error && <p className="error">{error}</p>}
        </form>
      )}

      {/* Profil existant */}
      {profile && (
        <section>
          <p><strong>ONMC :</strong> {profile.onmc}</p>
          <p><strong>Spécialité :</strong> {profile.speciality}</p>
          <p><strong>Lieu :</strong> {profile.workplace || '—'}</p>
          <label className="switch">
            <input type="checkbox" checked={profile.is_available} onChange={handleToggle} />
            <span className="slider" />
          </label>
          <span>{profile.is_available ? 'Disponible pour consultation' : 'Indisponible'}</span>
        </section>
      )}
    </div>
  );
}