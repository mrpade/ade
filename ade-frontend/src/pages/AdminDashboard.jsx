// src/components/AdminDashboard.jsx

import React, { useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  fetchSymptoms,
  fetchQuestions,
  fetchOptions,
  fetchScores,
  fetchRelatedDiseases,
  fetchDiseases,
  fetchDisease,
  createDisease,
  updateDisease,
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
  const [relatedDiseases, setRelatedDiseases] = useState([]);

  // Diseases section
  const [diseaseList, setDiseaseList] = useState([]);
  const [diseasePage, setDiseasePage] = useState(1);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseForm, setDiseaseForm] = useState({
    Nom: '',
    Symptomes: '',
    Causes: '',
    Transmission: '',
    Traitements: '',
    Gravite_sur_5: '',
    Contagieuse: '',
    Zone_geographique: '',
    Notes: ''
  });
  const [diseaseSymptoms, setDiseaseSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [symptomSuggestions, setSymptomSuggestions] = useState([]);
  const [showSymSuggestions, setShowSymSuggestions] = useState(false);

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
      setRelatedDiseases(data);
    };
    loadDiseases();
  }, [selectedSymptom]);

  // --- Load Diseases list ---
  useEffect(() => {
    if (section !== 'diseases') return;
    const load = async () => {
      const { data } = await fetchDiseases({ page: diseasePage, perPage: perPage });
      setDiseaseList(data);
    };
    load();
  }, [section, diseasePage]);

  // --- Load selected disease details ---
  useEffect(() => {
    if (!selectedDisease) return;
    const loadDetail = async () => {
      const { data } = await fetchDisease(selectedDisease.id);
      setDiseaseForm({
        Nom: data.disease.Nom || '',
        Symptomes: data.disease.Symptomes || '',
        Causes: data.disease.Causes || '',
        Transmission: data.disease.Transmission || '',
        Traitements: data.disease.Traitements || '',
        Gravite_sur_5: data.disease.Gravite_sur_5 || '',
        Contagieuse: data.disease.Contagieuse || '',
        Zone_geographique: data.disease.Zone_geographique || '',
        Notes: data.disease.Notes || ''
      });
      setDiseaseSymptoms(data.symptoms);
    };
    loadDetail();
  }, [selectedDisease]);

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

  const handleDiseaseFormChange = e => {
    const { name, value } = e.target;
    setDiseaseForm(f => ({ ...f, [name]: value }));
  };

  const handleSaveDisease = async e => {
    e.preventDefault();
    try {
      if (selectedDisease && selectedDisease.id) {
        const { data } = await updateDisease(selectedDisease.id, {
          ...diseaseForm,
          symptoms: diseaseSymptoms.map(s => s.name)
        });
        setSelectedDisease(data.disease);
        setDiseaseSymptoms(data.symptoms);
      } else {
        await createDisease({ ...diseaseForm, symptoms: diseaseSymptoms.map(s => s.name) });
        setDiseasePage(1);
      }
    } catch (err) {
      console.error('save disease error', err);
    }
  };

  const handleAddSymptomToDisease = e => {
    e.preventDefault();
    if (!newSymptom.trim()) return;
    setDiseaseSymptoms(s => [...s, { id: null, name: newSymptom.trim() }]);
    setNewSymptom('');
    setShowSymSuggestions(false);
  };

  const handleRemoveSymptom = name => {
    setDiseaseSymptoms(s => s.filter(sym => sym.name !== name));
  };

  // Fetch symptom suggestions when user types
  useEffect(() => {
    if (!newSymptom.trim()) {
      setSymptomSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get('/symptomes', {
          params: { q: newSymptom.trim(), full: true }
        });
        setSymptomSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('symptom suggestions error', err);
        setSymptomSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [newSymptom]);

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
              <div className="admin-dashboard-card" id='questions-card'>
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
                            {relatedDiseases.map(d => (
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
              <div className="admin-dashboard-card" id='maladies-liee-card'>
                <h2>Maladies liées</h2>
                {relatedDiseases.length === 0 ? (
                  <p>Aucune maladie</p>
                ) : (
                  <ul>
                    {relatedDiseases.map(d => (
                      <li key={d.id}>{d.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        {section === 'diseases' && (
          <>
            <div className="symptom-grid">
              {diseaseList.map(d => (
                <button
                  key={d.id}
                  className={
                    selectedDisease?.id === d.id
                      ? 'symptom-btn selected'
                      : 'symptom-btn'
                  }
                  onClick={() => {
                    setSelectedDisease(d);
                  }}
                >
                  {d.Nom}
                </button>
              ))}
              <button
                className="add-btn"
                onClick={() => {
                  setSelectedDisease({});
                  setDiseaseForm({
                    Nom: '',
                    Symptomes: '',
                    Causes: '',
                    Transmission: '',
                    Traitements: '',
                    Gravite_sur_5: '',
                    Contagieuse: '',
                    Zone_geographique: '',
                    Notes: ''
                  });
                  setDiseaseSymptoms([]);
                }}
              >
                Nouvelle maladie
              </button>
            </div>
            <div className="pagination">
              <button
                disabled={diseasePage === 1}
                onClick={() => setDiseasePage(p => Math.max(1, p - 1))}
                className="pagination-button"
              >
                Précédent
              </button>
              <button
                onClick={() => setDiseasePage(p => p + 1)}
                className="pagination-button"
              >
                Suivant
              </button>
            </div>
            {selectedDisease && (
              <div className="detail-cards">
                <div className="admin-dashboard-card" id='disease-info-card'>
                  <h2>{selectedDisease.id ? 'Éditer' : 'Nouvelle'} maladie</h2>
                  <form onSubmit={handleSaveDisease} className="admin-form">
                    <p>Nom</p>
                    <input
                      name="Nom"
                      value={diseaseForm.Nom}
                      onChange={handleDiseaseFormChange}
                      placeholder="Nom"
                      required
                    />
                    <p>Causes</p>
                    <textarea
                      name="Causes"
                      value={diseaseForm.Causes}
                      onChange={handleDiseaseFormChange}
                      placeholder="Causes"
                    />
                    <p>Mode de transmission</p>
                    <textarea
                      name="Transmission"
                      value={diseaseForm.Transmission}
                      onChange={handleDiseaseFormChange}
                      placeholder="Transmission"
                    />
                    <p>Traitements</p>
                    <textarea
                      name="Traitements"
                      value={diseaseForm.Traitements}
                      onChange={handleDiseaseFormChange}
                      placeholder="Traitements"
                    />
                    <p>Gravité sur 5</p>
                    <input
                      name="Gravite_sur_5"
                      value={diseaseForm.Gravite_sur_5}
                      onChange={handleDiseaseFormChange}
                      placeholder="Gravité sur 5"
                    />
                    <p>Contagieuse (Oui/non)</p>
                    <input
                      name="Contagieuse"
                      value={diseaseForm.Contagieuse}
                      onChange={handleDiseaseFormChange}
                      placeholder="Contagieuse"
                    />
                    <p>Zone géographique</p>
                    <textarea
                      name="Zone_geographique"
                      value={diseaseForm.Zone_geographique}
                      onChange={handleDiseaseFormChange}
                      placeholder="Zone géographique"
                    />
                    <p>Notes</p>
                    <textarea
                      name="Notes"
                      value={diseaseForm.Notes}
                      onChange={handleDiseaseFormChange}
                      placeholder="Notes"
                    />
                    <button type="submit" className="add-btn">Enregistrer</button>
                  </form>
                </div>
                <div className="admin-dashboard-card" id='disease-symptoms-card'>
                  <h2>Symptômes liés</h2>
                  {diseaseSymptoms.length === 0 ? (
                    <p>Aucun symptôme</p>
                  ) : (
                    <ul>
                      {diseaseSymptoms.map(s => (
                        <li key={s.name}>
                          {s.name}
                          <button
                            className="delete-btn"
                            onClick={() => handleRemoveSymptom(s.name)}
                          >
                            Supprimer
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <form onSubmit={handleAddSymptomToDisease} className="admin-form" autoComplete="off">
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        value={newSymptom}
                        onChange={e => { setNewSymptom(e.target.value); setShowSymSuggestions(true); }}
                        onFocus={() => setShowSymSuggestions(true)}
                        placeholder="Nouveau symptôme"
                        className="search-input"
                      />
                      {showSymSuggestions && symptomSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {symptomSuggestions.map(s => (
                            <li key={s.id || s.name} onMouseDown={() => { setNewSymptom(s.name); setShowSymSuggestions(false); }}>
                              {s.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button type="submit" className="add-btn">Ajouter</button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* TODO: Implement Users & Diseases sections later */}
      </section>
    </div>
  );
}
