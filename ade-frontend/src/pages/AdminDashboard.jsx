import { useContext, useEffect, useState, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  fetchQuestions,
  createQuestion,
  deleteQuestion,
  addOption,
  deleteOption,
  addImpact,
  deleteImpact
} from '../api/admin';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { token, role } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ question_text: '', question_type: 'yes_no', trigger_symptom_id: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [symInput, setSymInput] = useState('');
  const [symSuggestions, setSymSuggestions] = useState([]);
  const [showSymSug, setShowSymSug] = useState(false);

  const load = async () => {
    try {
      const { data } = await fetchQuestions(search ? { symptom: search } : {});
      setQuestions(data);
    } catch (err) {
      console.error('fetch questions', err);
      setError('Erreur de chargement');
    }
  };

  useEffect(() => {
    if (role === 'admin' && token) load();
  }, [token, role]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async e => {
    e.preventDefault();
    try {
      await createQuestion(form);
      setForm({ question_text: '', question_type: 'yes_no', trigger_symptom_id: '' });
      setSymInput('');
      load();
    } catch(err) {
      console.error('create question', err);
      setError('Erreur création');
    }
  };

  const handleAddOption = async (qid, label) => {
    if (!label) return;
    await addOption(qid, { option_label: label });
    load();
  };

  const handleDeleteQuestion = async id => { await deleteQuestion(id); load(); };
  const handleDeleteOption = async id => { await deleteOption(id); load(); };
  const handleDeleteImpact = async id => { await deleteImpact(id); load(); };

  const handleAddImpact = async (optId, disease_id, score_delta) => {
    if (!disease_id) return;
    await addImpact(optId, { disease_id, score_delta });
    load();
  };

  const fetchSymSug = useMemo(() =>
    debounce(async frag => {
      if (!frag) { setSymSuggestions([]); return; }
      try {
        const { data } = await api.get('/symptomes', { params: { q: frag, full: 1 } });
        setSymSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('symptom suggestions', err);
      }
    }, 300)
  , []);

  useEffect(() => {
    fetchSymSug(symInput.trim());
    return () => fetchSymSug.cancel();
  }, [symInput, fetchSymSug]);

  if (role !== 'admin') return <p>Access Denied</p>;

  return (
    <div className="container admin-dashboard">
      <h1>Administration</h1>
      <form onSubmit={handleCreate} className="question-form" autoComplete="off">
        <input name="question_text" placeholder="Texte" value={form.question_text} onChange={handleChange} required />
        <select name="question_type" value={form.question_type} onChange={handleChange}>
          <option value="yes_no">Oui/Non</option>
          <option value="multiple_choice">Choix multiple</option>
          <option value="number">Nombre</option>
          <option value="scale">Echelle</option>
        </select>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Symptôme"
            value={symInput}
            onChange={e => { setSymInput(e.target.value); setShowSymSug(true); }}
            onFocus={() => setShowSymSug(true)}
          />
          {showSymSug && symSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {symSuggestions.map(s => (
                <li
                  key={s.id || s.name}
                  onMouseDown={() => { setSymInput(s.name); setForm(f => ({ ...f, trigger_symptom_id: s.id || '' })); setShowSymSug(false); }}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input name="trigger_symptom_id" placeholder="Symptom ID" value={form.trigger_symptom_id} onChange={handleChange} />
        <button type="submit">Créer</button>
      </form>
      {error && <p className="error">{error}</p>}

      <div className="search-bar">
        <input placeholder="Filtrer par symptôme" value={search} onChange={e=>setSearch(e.target.value)} />
        <button onClick={load}>Rechercher</button>
      </div>

      <ul className="question-list">
        {questions.map(q => (
          <li key={q.id} className="question-item">
            <div className="question-header">
              <strong>#{q.id}</strong> {q.question_text}
              <button onClick={() => handleDeleteQuestion(q.id)}>Supprimer</button>
            </div>
            <ul>
              {q.options.map(o => (
                <li key={o.id}>
                  {o.option_label}
                  <button onClick={() => handleDeleteOption(o.id)}>X</button>
                  <ul>
                    {o.impacts.map(im => (
                      <li key={im.id}>
                        Maladie {im.disease_id} : {im.score_delta}
                        <button onClick={() => handleDeleteImpact(im.id)}>X</button>
                      </li>
                    ))}
                    <li>
                      <small>Ajouter impact :</small>
                      <AddImpactForm optionId={o.id} onAdd={handleAddImpact} />
                    </li>
                  </ul>
                </li>
              ))}
              <li>
                <AddOptionForm questionId={q.id} onAdd={handleAddOption} />
              </li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddOptionForm({ questionId, onAdd }) {
  const [label, setLabel] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onAdd(questionId, label); setLabel(''); }}>
      <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Nouvelle option" />
      <button type="submit">Ajouter</button>
    </form>
  );
}

function AddImpactForm({ optionId, onAdd }) {
  const [diseaseId, setDiseaseId] = useState('');
  const [delta, setDelta] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onAdd(optionId, diseaseId, delta); setDiseaseId(''); setDelta(''); }}>
      <input value={diseaseId} onChange={e=>setDiseaseId(e.target.value)} placeholder="Disease ID" />
      <input value={delta} onChange={e=>setDelta(e.target.value)} placeholder="Delta" />
      <button type="submit">Ajouter</button>
    </form>
  );
}
