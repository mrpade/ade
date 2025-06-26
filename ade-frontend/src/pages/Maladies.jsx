// src/pages/Maladies.jsx
import { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import api from '../services/api';
import { getAvailableDoctors } from '../api/doctors';
import { createCheck } from '../api/checks';
import QuestionCard from '../components/QuestionCard';
import { interactiveSearch } from '../api/diseases';
import { AuthContext } from '../context/AuthContext';
/*import SymptomSearch from '../components/SymptomSearch';*/

export default function Maladies() {
  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState([]);
  const [suggestions, setSuggestions]   = useState([]);
  const [showSug, setShowSug]           = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [doctors, setDoctors]           = useState([]);
  const [selecting, setSelecting]       = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [questions, setQuestions]       = useState([]);
  const [qIndex, setQIndex]             = useState(0);
  const [responses, setResponses]       = useState([]);
  const [currentSymptoms, setCurrentSymptoms] = useState([]);

  const navigate = useNavigate();
  const { token } = useContext(AuthContext);



  // Extrait le dernier fragment (après la dernière virgule)
  const getLastTerm = q =>
    q.split(',').pop().trim().toLowerCase();

  // Debounce pour ne pas spammer l'API à chaque frappe
  const fetchSug = useMemo(() =>
    debounce(async frag => {
      if (!frag) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await api.get('/symptomes', { params: { q: frag }});
        setSuggestions(data);
        setHighlightedIndex(-1);  // reset sur nouveau jeu
      } catch (err) {
        console.error(err);
      }
    }, 300)
  , []);

  useEffect(() => {
    const frag = getLastTerm(query);
    fetchSug(frag);
    return () => fetchSug.cancel();
  }, [query, fetchSug]);

  // Remplace le fragment courant par la suggestion
  const onSelectSug = s => {
    setQuery(prev => {
      const parts = prev.split(',').map(p => p.trim()).filter(Boolean);
      // remplace le dernier par s
      parts[parts.length - 1] = s;
      return parts.join(', ') + (prev.endsWith(',') ? ', ' : '');
    });
    setShowSug(false);
  };

  // Gestion du clavier pour la navigation
  const onKeyDown = e => {
    if (!showSug || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(idx => {
          const next = idx + 1;
          return next >= suggestions.length ? 0 : next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(idx => {
          const prev = idx - 1;
          return prev < 0 ? suggestions.length - 1 : prev;
        });
        break;
      case 'Enter':
        if (highlightedIndex >= 0) {
          e.preventDefault();
          onSelectSug(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSug(false);
        break;
    }
  };

  const handleSearch = async e => {
    e.preventDefault();
    const symptoms = query
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    try {
      const { data } = await interactiveSearch(symptoms);
      setCurrentSymptoms(symptoms);
      if (data.questions && data.questions.length) {
        setQuestions(data.questions);
        setQIndex(0);
        setResponses([]);
        setResults([]);
      } else {
        setResults(data.diseases.slice(0, 3));
      }
      setShowSug(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckClick = async disease => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await getAvailableDoctors();
      setDoctors(data);
      setSelecting(disease);
      setSelectedDoctor('');
    } catch (err) {
      console.error('fetch doctors failed', err);
    }
  };

  const handleSubmitCheck = async () => {
    if (!selectedDoctor || !selecting) return;
    try {
      const symptoms = query
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      await createCheck(selecting.id, symptoms, selectedDoctor);
      setSelecting(null);
    } catch (err) {
      console.error('create check error', err);
    }
  };

  const handleAnswer = async optionId => {
    const question = questions[qIndex];
    const newResponses = [
      ...responses,
      { questionId: question.id, optionId }
    ];
    if (qIndex + 1 < questions.length) {
      setResponses(newResponses);
      setQIndex(qIndex + 1);
    } else {
      try {
        const { data } = await interactiveSearch(currentSymptoms, newResponses);
        setResults(data.diseases.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setQuestions([]);
        setResponses([]);
        setQIndex(0);
      }
    }
  };

  return (
    <div className="container">
      <h1>Recherche de maladies</h1>

      <form onSubmit={handleSearch} className="search-form" autoComplete="off">
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Ex. fièvre, toux"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSug(true); }}
            onFocus={() => setShowSug(true)}
            onKeyDown={onKeyDown}
            className="search-input"
          />
          {showSug && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onMouseDown={() => onSelectSug(s)}  // use onMouseDown pour éviter blur avant click
                  className={i === highlightedIndex ? 'highlighted' : ''}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit">Rechercher</button>
      </form>

      {questions.length > 0 ? (
        <QuestionCard question={questions[qIndex]} onAnswer={handleAnswer} />
      ) : results.length === 0 ? (
        <p>Aucun résultat.</p>
      ) : (
        <div className="card-grid">
          {results.map((m, i) => (
            <div key={i} className="card">
              <h2>{m.Nom}</h2>
              <p><strong>Symptômes :</strong> {m.Symptomes}</p>
              <p><strong>Causes :</strong> {m.Causes}</p>
              <p><strong>Transmission :</strong> {m.Transmission}</p>
              <p><strong>Traitements :</strong> {m.Traitements}</p>
              {m.score !== undefined && (
                <p><strong>Score :</strong> {m.score}</p>
              )}
              {i === 0 && (
                <>
                  <button onClick={() => handleCheckClick(m)}>Check</button>
                  {selecting && selecting.id === m.id && (
                    <div className="doctor-select">
                      <select
                        value={selectedDoctor}
                        onChange={e => setSelectedDoctor(e.target.value)}
                      >
                        <option value="">Choisissez un médecin</option>
                        {doctors.map(doc => (
                          <option key={doc.user_id} value={doc.user_id}>
                            {doc.account?.first_name} {doc.account?.last_name}
                          </option>
                        ))}
                      </select>
                      <button onClick={handleSubmitCheck}>Envoyer</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
