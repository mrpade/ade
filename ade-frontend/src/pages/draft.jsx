import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { createDoctorProfile, toggleAvailability } from '../api/doctors';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const { token, logout } = useContext(AuthContext);
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ speciality: '', onmc: '', workplace: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checks, setChecks] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const { data } = await api.get('/moncompte');
        setUser(data);
      } catch (err) {
        console.error('Doctor dashboard user fetch error', err);
        if (err.response?.status === 401) logout();
      }

      try {
        const { data } = await api.get('/doctors/me');
        setDoctor(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setDoctor(null);
        } else {
          console.error('Doctor dashboard fetch error', err);
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
      const { data } = await createDoctorProfile(form);
      setDoctor(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur création profil');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = id => {
    console.log('validate check', id);
  };
  const handleStartConsult = pid => {
    console.log('start consult', pid);
  };
  const handleJoinAppointment = id => {
    console.log('join appointment', id);
  };

  const handleToggleAvailability = async () => {
    try {
      const newFlag = !doctor.is_available;
      await toggleAvailability(newFlag);
      setDoctor(d => ({ ...d, is_available: newFlag }));
    } catch (err) {
      console.error('toggle availability error', err);
    }
  };

  if (!token) return <p>Veuillez vous connecter.</p>;

  if (!doctor) {
    return (
      <div className="doc-dashboard">
        <form className="doc-form" onSubmit={handleCreate}>
          <h2>Compléter votre profil</h2>
          <input name="speciality" placeholder="Spécialité" value={form.speciality} onChange={handleChange} required />
          <input name="onmc" placeholder="Numéro ONMC" value={form.onmc} onChange={handleChange} required />
          <input name="workplace" placeholder="Lieu d'exercice" value={form.workplace} onChange={handleChange} />
          <textarea name="bio" placeholder="Présentation" value={form.bio} onChange={handleChange} />
          <button disabled={loading}>{loading ? 'Enregistrement…' : 'Créer mon profil'}</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="navbar">Tableau de bord</div>
      <div className="main-content">
        <aside className="sidebar">
          <div className="profile-pic">Photo</div>
          <h3>
            {user ? `${user.first_name} ${user.last_name}` : ''}
            <span className={`status-dot ${doctor.is_available ? 'green' : 'red'}`}></span>
          </h3>
          <p>{doctor.onmc}</p>
          <button className="btn-availability" onClick={handleToggleAvailability}>
            {doctor.is_available ? 'Me rendre indisponible' : 'Me rendre disponible'}
          </button>
          <button className="btn-edit">Éditer mon profil</button>
          <ul className="sidebar-menu">
            <li>Revenus</li>
            <li>Historique</li>
            <li>Paramètres</li>
          </ul>
          <button className="btn-logout" onClick={logout}>Déconnexion</button>
        </aside>

        <section className="dashboard-content">
          <div className="section">
            <h2>Checks en attente</h2>
            {checks.length === 0 ? (
              <div className="empty-state">Suspense…</div>
            ) : (
              <div className="card-grid">
                {checks.map(check => (
                  <div className="card" key={check.id}>
                    <div className="card-header">
                      <strong>{check.patientName}, {check.age}, {check.gender}</strong>
                      <span className="badge green">Carnet</span>
                    </div>
                    <p>Symptômes : {check.symptoms}</p>
                    <p>Résultat : {check.diagnosis}</p>
                    <p>Notes : {check.notes}</p>
                    <div className="card-actions">
                      <button className="btn green" onClick={() => handleValidate(check.id)}>Valider</button>
                      <button className="btn pink" onClick={() => handleStartConsult(check.patientId)}>Consultation/Diagnostic</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section">
            <h2>Mes Rendez-vous</h2>
            {appointments.length === 0 ? (
              <div className="empty-state">Suspense…</div>
            ) : (
              <div className="card-grid">
                {appointments.map(rdv => (
                  <div className="card" key={rdv.id}>
                    <div className="card-header">
                      <strong>{rdv.patientName}, {rdv.age}, {rdv.gender}</strong>
                      <span className="badge green">Carnet</span>
                    </div>
                    <p>Notes : {rdv.notes}</p>
                    <p>Heure : {rdv.time}</p>
                    <div className="card-actions">
                      <button className="btn green" onClick={() => handleJoinAppointment(rdv.id)}>Aller</button>
                      <button className="btn pink">Reprogrammer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}