// src/components/AdminDashboard.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  fetchSymptoms,
  fetchQuestions,
  fetchOptions,
  fetchScores
} from '../api/admin'; // your admin-specific API methods
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { token, role } = useContext(AuthContext);

  // --- UI State ---
  const [section, setSection] = useState('symptoms');
  const [symptoms, setSymptoms] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 15;

  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [viewType, setViewType] = useState('questions'); // 'questions' | 'options' | 'scores'

  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [scores, setScores] = useState([]);

  // --- Load Symptoms ---
  useEffect(() => {
    if (role !== 'admin') return;
    (async () => {
      const { data } = await fetchSymptoms({ page, perPage, sort: 'name' });
      setSymptoms(data);
    })();
  }, [role, page]);

  // --- Load Detail Data when symptom or viewType changes ---
  useEffect(() => {
    if (!selectedSymptom) return;

    const loadDetail = async () => {
      const id = selectedSymptom.id;
      if (viewType === 'questions') {
        const { data } = await fetchQuestions({ symptom: id });
        setQuestions(data);
      } else if (viewType === 'options') {
        const { data } = await fetchOptions(id);
        setOptions(data);
      } else if (viewType === 'scores') {
        const { data } = await fetchScores(id);
        setScores(data);
      }
    };

    loadDetail();
  }, [selectedSymptom, viewType]);

  if (role !== 'admin') return <p>Access Denied</p>;

  return (
    
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <ul>
          <li
            className={section === 'users' ? 'active' : ''}
            onClick={() => setSection('users')}
          >
            Utilisateurs
          </li>
          <li
            className={section === 'diseases' ? 'active' : ''}
            onClick={() => setSection('diseases')}
          >
            Maladies
          </li>
          <li
            className={section === 'symptoms' ? 'active' : ''}
            onClick={() => setSection('symptoms')}
          >
            Symptômes
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <section className="main-content">
        {section === 'symptoms' && (
          <>
            {/* Symptom Grid */}
            <div className="symptom-grid">
              {symptoms.map((sym) => (
                <button
                  key={sym.id}
                  className={
                    selectedSymptom?.id === sym.id
                      ? 'symptom-btn selected'
                      : 'symptom-btn'
                  }
                  onClick={() => {
                    setSelectedSymptom(sym);
                    setViewType('questions');
                  }}
                >
                  {sym.name}
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className='pagination-button'
              >
                Précédent
              </button>
              <button 
                onClick={() => setPage((p) => p + 1)}
                className='pagination-button'
              >
                Suivant</button>
            </div>

            {/* Detail Cards */}
            <div className="detail-cards">
              {/* Top‐Left Card */}
              <div className="admin-dashboard-card">
                <div className="card-header">
                  <h2>
                    {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                  </h2>
                  <select
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value)}
                  >
                    <option value="questions">Questions</option>
                    <option value="options">Options</option>
                    <option value="scores">Score</option>
                  </select>
                </div>
                <div className="card-body">
                  {viewType === 'questions' && (
                    <>
                      {questions.length > 0 ? (
                        <ol>
                          {questions.map((q) => (
                            <li key={q.id}>{q.question_text}</li>
                          ))}
                        </ol>
                      ) : (
                        <button className="add-btn">Ajouter une question</button>
                      )}
                    </>
                  )}

                  {viewType === 'options' && (
                    <>
                      {options.length > 0 ? (
                        <ul>
                          {options.map((o) => (
                            <li key={o.id}>{o.text}</li>
                          ))}
                        </ul>
                      ) : (
                        <button className="add-btn">Ajouter une option</button>
                      )}
                    </>
                  )}

                  {viewType === 'scores' && (
                    <>
                      {scores.length > 0 ? (
                        <ul>
                          {scores.map((s) => (
                            <li key={s.id}>
                              {s.disease_name} : {s.value}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <button className="add-btn">Ajouter un score</button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Bottom‐Right Card (example placeholder) */}
              <div className="admin-dashboard-card">
                <h2>Maladies liées</h2>
                {/* you can fill this similarly from your API */}
                <p>…</p>
              </div>
            </div>
          </>
        )}

        {/* TODO: Implement Users & Diseases sections later */}
      </section>
    </div>
  );
}
