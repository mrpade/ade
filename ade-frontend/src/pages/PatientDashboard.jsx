import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const { token, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [checks, setChecks] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const profileRes = await api.get('/patient/profile');
        setProfile(profileRes.data);
        const checksRes = await api.get('/patient/checks');
        setChecks(checksRes.data);
        const appRes = await api.get('/patient/appointments');
        setAppointments(appRes.data);
      } catch (err) {
        console.error('patient dashboard fetch error', err);
        if (err.response?.status === 401) logout();
      }
    };
    fetchData();
  }, [token, logout]);

  return (
    <div className="container" id='patient-dashboard-container'>
        <aside className="profile-sidebar">
          <div className="profile-pic">
            <img src="" alt="profile picture" />
          </div>
          <h2 id='profile-name'>{profile?.firstName} {profile?.lastName}</h2>
          <p>{profile?.age} ans, {profile?.gender}</p>
          <button className="btn-edit">Éditer mon profil</button>
          <ul className="sidebar-menu">
            <li>Mon abonnement</li>
            <li>Historique</li>
            <li>Paramètres</li>
          </ul>
          <button className="btn-logout">Déconnexion</button>
        </aside>
      <div className="dashboard-content">
          <div id='patient-dashboard-header'>Bienvenue, {profile?.firstName} {profile?.lastName}</div>
        <div className="content">
          <section>
            <h2>Mes Checks</h2>
            <div className="grid">
              {checks.map(check => (
                <div className="card" key={check.id}>
                  <div className="card-header">
                    <strong>{check.doctorName}, {check.doctorSpecialty}</strong>
                    <span className="badge green">Profil</span>
                  </div>
                  <p><strong>Symptômes :</strong> {check.symptoms}</p>
                  <p><strong>Résultat :</strong> {check.result}</p>
                  <p><strong>Réponse du médecin :</strong> {check.notes}</p>
                  <div className="card-actions">
                    {check.notes && (
                      check.notes === 'Veuillez prendre rdv' ? (
                        <button className="btn pink" onClick={() => window.location = `/consult/${check.id}`}>Consultation/Diagnostic</button>
                      ) : (
                        <button className="btn green" onClick={() => window.location = `/pharmacy/${check.id}`}>Pharmacie</button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Mes Rendez-vous</h2>
            <div className="grid">
              {appointments.map(rdv => (
                <div className="card" key={rdv.id}>
                  <div className="card-header">
                    <strong>{rdv.doctorName}, {rdv.doctorSpecialty}</strong>
                    <span className="badge green">Profil</span>
                  </div>
                  <p><strong>Notes :</strong> {rdv.notes}</p>
                  <p><strong>Heure :</strong> {rdv.time}</p>
                  <div className="card-actions">
                    <button className="btn green" onClick={() => window.location = `/appointment/${rdv.id}`}>Aller</button>
                    <button className="btn pink">Reprogrammer</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
