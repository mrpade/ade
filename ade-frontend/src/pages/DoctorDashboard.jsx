import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { createDoctorProfile, toggleAvailability } from '../api/doctors';
import { getDoctorChecks, updateCheckAnswer } from '../api/checks';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const { token, logout } = useContext(AuthContext);
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ speciality: '', onmc: '', workplace: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checks, setChecks] = useState([]);
  const [appointments] = useState([]);
  const [answerId, setAnswerId] = useState(null);
  const [answerText, setAnswerText] = useState('');

  const calcAge = dateStr => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

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
        const checksRes = await getDoctorChecks();
        const mapped = checksRes.data
          .filter(c => !c.answer)
          .map(c => ({
          id: c.id,
          patientName: `${c.Diagnosis.patient.first_name} ${c.Diagnosis.patient.last_name}`,
          age: calcAge(c.Diagnosis.patient.birthdate),
          symptoms: Array.isArray(c.Diagnosis.symptoms_json)
            ? c.Diagnosis.symptoms_json.join(', ')
            : (c.Diagnosis.symptoms_json ? JSON.parse(c.Diagnosis.symptoms_json).join(', ') : ''),
          diagnosis: c.Diagnosis.disease?.Nom,
          patientId: c.Diagnosis.patient_id
        }));
        setChecks(mapped);
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
    setAnswerId(id);
    setAnswerText('');
  };

  const handleSubmitAnswer = async e => {
    e.preventDefault();
    if (!answerId) return;
    try {
      await updateCheckAnswer(answerId, answerText);
      setChecks(cs => cs.filter(c => c.id !== answerId));
    } catch (err) {
      console.error('submit answer error', err);
    } finally {
      setAnswerId(null);
      setAnswerText('');
    }
  };

  const handleStartConsult = id => {
    updateCheckAnswer(id, 'Veuillez prendre rdv')
      .then(() => setChecks(cs => cs.filter(c => c.id !== id)))
      .catch(err => console.error('consult request error', err));
  };
  const handleJoinAppointment = id => {
    console.log('join appointment', id);
  };

  const handleToggleAvailability = async () => {
    if (!doctor) return;
    const newStatus = !doctor.is_available;
    try {
      await toggleAvailability(newStatus);
      setDoctor(d => ({ ...d, is_available: newStatus }));
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
    <div className="container" id='doc-dashboard-container'>
        <aside className="profile-sidebar">
          <div className="profile-pic">
            <img src="" alt="profile picture" />
          </div>
          <h2 id='profile-name'>
            {user ? `${user.first_name} ${user.last_name}` : ''}
            <span
              className={`status-indicator ${doctor.is_available ? 'green' : 'red'}`}
            />
          </h2>
          <p><i>ONMC No. {doctor.onmc}</i></p>
          <button className="btn toggle" onClick={handleToggleAvailability}>
            {doctor.is_available ? 'Se mettre hors ligne' : 'Se rendre disponible'}
          </button>
          <button id="btn-edit">Éditer mon profil</button>
          <ul className="sidebar-menu">
            <li>Mes revenus</li>
            <li>Historique</li>
            <li>Paramètres</li>
          </ul>
          <button className="btn-logout" onClick={logout}>Déconnexion</button>
        </aside>

        <section className="dashboard-content">
          <div className="doc-dashboard-navbar"><h2>Mon Tableau de Bord</h2></div>
          <div className="section">
            <h3>Checks en attente</h3>
            {checks.length === 0 ? (
              <div className="empty-state">Pas de Check en attente</div>
            ) : (
              <div className="card-grid">
                {checks.map(check => (
                  <div className="" id="doc-dashboard-card" key={check.id}>
                    <div className="card-header">
                      <strong>{check.patientName}, {check.age}, {check.gender}</strong>
                      <span className="badge green">Carnet</span>
                    </div>
                    <p>Symptômes : {check.symptoms}</p>
                    <p>Résultat : {check.diagnosis}</p>
                    <p>Notes : {check.notes}</p>
                    {answerId === check.id ? (
                      <form onSubmit={handleSubmitAnswer} className="answer-form">
                        <input
                          value={answerText}
                          onChange={e => setAnswerText(e.target.value)}
                          placeholder="Votre réponse"
                          required
                        />
                        <button type="submit" className="btn green">Submit</button>
                      </form>
                    ) : (
                      <div className="card-actions">
                        <button className="btn green" onClick={() => handleValidate(check.id)}>Valider</button>
                        <button className="btn pink" onClick={() => handleStartConsult(check.id)}>Consultation/Diagnostic</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section">
            <h3>Mes Rendez-vous</h3>
            {appointments.length === 0 ? (
              <div className="empty-state">Pas de Rendez-vous aujourd'hui</div>
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
  );
}
