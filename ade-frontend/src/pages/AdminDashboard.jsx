// src/components/AdminDashboard.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  fetchSymptoms,
  fetchQuestions,
  fetchOptions,
  fetchScores,
  fetchRelatedDiseases,
  createQuestion,
  addOption,
  addImpact,
  deleteQuestion,
  deleteOption,
  deleteImpact
} from '../api/admin'; // your admin-specific API methods
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { role } = useContext(AuthContext);

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
  const [diseases, setDiseases] = useState([]);

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: '', type: 'yes_no' });

  const [showOptionForm, setShowOptionForm] = useState(false);
  const [newOption, setNewOption] = useState({ questionId: '', values: [''] });

  const [showScoreForm, setShowScoreForm] = useState(false);
  const [newScore, setNewScore] = useState({ optionId: '', diseaseId: '', value: '' });

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
        const optRes = await fetchOptions(id);
        setOptions(optRes.data);
      }
    };

    loadDetail();
  }, [selectedSymptom, viewType]);

  // Load diseases when symptom changes
  useEffect(() => {
    if (!selectedSymptom) return;
    const loadDiseases = async () => {
      const { data } = await fetchRelatedDiseases(selectedSymptom.id);
      setDiseases(data);
    };
    loadDiseases();
  }, [selectedSymptom]);

  const handleCreateQuestion = async e => {
    e.preventDefault();
    if (!selectedSymptom) return;
    try {
      await createQuestion({
        question_text: newQuestion.text,
        question_type: newQuestion.type,
        trigger_symptom_id: selectedSymptom.id
      });
      const { data } = await fetchQuestions({ symptom: selectedSymptom.id });
      setQuestions(data);
      setShowQuestionForm(false);
      setNewQuestion({ text: '', type: 'yes_no' });
    } catch (err) {
      console.error('create question error', err);
    }
  };

  const handleCreateOption = async e => {
    e.preventDefault();
    try {
      const qId = parseInt(newOption.questionId, 10);
      const q = questions.find(q => q.id === qId);
      if (!q) return;
      if (q.question_type === 'yes_no') {
        await addOption(qId, { option_label: 'Yes' });
        await addOption(qId, { option_label: 'No' });
      } else {
        for (const val of newOption.values) {
          if (val && val.trim() !== '') {
            await addOption(qId, { option_label: val });
          }
        }
      }
      const { data } = await fetchOptions(selectedSymptom.id);
      setOptions(data);
      setShowOptionForm(false);
      setNewOption({ questionId: '', values: [''] });
    } catch (err) {
      console.error('create option error', err);
    }
  };

  const handleCreateScore = async e => {
    e.preventDefault();
    try {
      await addImpact(newScore.optionId, {
        disease_id: newScore.diseaseId,
        score_delta: newScore.value
      });
      const { data } = await fetchScores(selectedSymptom.id);
      setScores(data);
      setShowScoreForm(false);
      setNewScore({ optionId: '', diseaseId: '', value: '' });
    } catch (err) {
      console.error('create score error', err);
    }
  };

  const handleDeleteQuestion = async id => {
    if (!selectedSymptom) return;
    try {
      await deleteQuestion(id);
      const { data } = await fetchQuestions({ symptom: selectedSymptom.id });
      setQuestions(data);
    } catch (err) {
      console.error('delete question error', err);
    }
  };

  const handleDeleteOption = async id => {
    if (!selectedSymptom) return;
    try {
      await deleteOption(id);
      const { data } = await fetchOptions(selectedSymptom.id);
      setOptions(data);
    } catch (err) {
      console.error('delete option error', err);
    }
  };

  const handleDeleteScore = async id => {
    if (!selectedSymptom) return;
    try {
      await deleteImpact(id);
      const { data } = await fetchScores(selectedSymptom.id);
      setScores(data);
    } catch (err) {
      console.error('delete score error', err);
    }
  };

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
                      {questions.length > 0 && (
                        <ol>
                          {questions.map((q) => (
                            <li key={q.id}>
                              {q.question_text}
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteQuestion(q.id)}
                              >
                                Supprimer
                              </button>
                            </li>
                          ))}
                        </ol>
                      )}
                      {showQuestionForm ? (
                        <form onSubmit={handleCreateQuestion} className="admin-form">
                          <input
                            value={newQuestion.text}
                            onChange={e => setNewQuestion(n => ({ ...n, text: e.target.value }))}
                            placeholder="Question"
                            required
                          />
                          <select
                            value={newQuestion.type}
                            onChange={e => setNewQuestion(n => ({ ...n, type: e.target.value }))}
                          >
                            <option value="yes_no">Oui/Non</option>
                            <option value="multiple_choice">Choix multiple</option>
                            <option value="number">Nombre</option>
                            <option value="scale">Échelle</option>
                          </select>
                          <button type="submit" className="add-btn">Valider</button>
                        </form>
                      ) : (
                        <button className="add-btn" onClick={() => setShowQuestionForm(true)}>
                          Ajouter une question
                        </button>
                      )}
                    </>
                  )}

                  {viewType === 'options' && (
                    <>
                      {options.length > 0 && (
                        <ul>
                          {options.map((o) => (
                            <li key={o.id}>
                              <strong>{o.question_text}</strong> : {o.text}
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteOption(o.id)}
                              >
                                Supprimer
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {showOptionForm ? (
                        <form onSubmit={handleCreateOption} className="admin-form">
                          <select
                            value={newOption.questionId}
                            onChange={e => {
                              const id = e.target.value;
                              setNewOption(o => ({ ...o, questionId: id }));
                            }}
                            required
                          >
                            <option value="">-- Question --</option>
                            {questions.map(q => (
                              <option key={q.id} value={q.id}>{q.question_text}</option>
                            ))}
                          </select>
                          {(() => {
                            const q = questions.find(q => q.id === parseInt(newOption.questionId,10));
                            if (q?.question_type === 'yes_no') {
                              return <p>Options "Yes" et "No" ajoutées automatiquement</p>;
                            }
                            const count = q?.question_type === 'multiple_choice' ? 4 : 1;
                            const fields = [];
                            for (let i=0;i<count;i++) {
                              fields.push(
                                <input
                                  key={i}
                                  value={newOption.values[i] || ''}
                                  onChange={e => {
                                    const vals = [...newOption.values];
                                    vals[i] = e.target.value;
                                    setNewOption(o => ({ ...o, values: vals }));
                                  }}
                                  placeholder={`Option ${i+1}`}
                                />
                              );
                            }
                            return fields;
                          })()}
                          <button type="submit" className="add-btn">Valider</button>
                        </form>
                      ) : (
                        <button className="add-btn" onClick={() => setShowOptionForm(true)}>Ajouter une option</button>
                      )}
                    </>
                  )}

                  {viewType === 'scores' && (
                    <>
                      {scores.length > 0 && (
                        <ul>
                          {scores.map((s) => (
                            <li key={s.id}>
                              {s.disease_name} - {s.option_text} : {s.value}
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteScore(s.id)}
                              >
                                Supprimer
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {showScoreForm ? (
                        <form onSubmit={handleCreateScore} className="admin-form">
                          <select
                            value={newScore.optionId}
                            onChange={e => setNewScore(s => ({ ...s, optionId: e.target.value }))}
                            required
                          >
                            <option value="">-- Option --</option>
                            {options.map(o => (
                              <option key={o.id} value={o.id}>
                                {o.question_text ? `${o.question_text} - ${o.text}` : o.text}
                              </option>
                            ))}
                          </select>
                          <select
                            value={newScore.diseaseId}
                            onChange={e => setNewScore(s => ({ ...s, diseaseId: e.target.value }))}
                            required
                          >
                            <option value="">-- Maladie --</option>
                            {diseases.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            value={newScore.value}
                            onChange={e => setNewScore(s => ({ ...s, value: e.target.value }))}
                            placeholder="Score"
                            required
                          />
                          <button type="submit" className="add-btn">Valider</button>
                        </form>
                      ) : (
                        <button className="add-btn" onClick={() => setShowScoreForm(true)}>Ajouter un score</button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Bottom‐Right Card */}
              <div className="admin-dashboard-card">
                <h2>Maladies liées</h2>
                {diseases.length === 0 ? (
                  <p>Aucune maladie</p>
                ) : (
                  <ul>
                    {diseases.map(d => (
                      <li key={d.id}>{d.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        {/* TODO: Implement Users & Diseases sections later */}
      </section>
    </div>
  );
}
