/*import { useState } from 'react';
import api from '../services/api';

export default function Maladies() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async e => {
    e.preventDefault();
    const { data } = await api.get('/maladies', { params: { symptomes: query }});
    setResults(data);
  };

  return (
    <div className="container">
      <h1>Recherche de maladies</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Ex. fièvre, toux"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit">Rechercher</button>
      </form>

      {results.length === 0 
        ? <p>Aucun résultat.</p>
        : results.map((m,i) => (
          <div key={i} className="card">
            <h2>{m.Nom}</h2>
            <p><strong>Symptômes :</strong> {m.Symptomes}</p>
            <p><strong>Causes :</strong> {m.Causes}</p>
            <p><strong>Transmission :</strong> {m.Transmission}</p>
            <p><strong>Traitements :</strong> {m.Traitements}</p>
          </div>
        ))
      }
    </div>
  );
}*/

// src/pages/Maladies.jsx
// src/pages/Maladies.jsx
import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import api from '../services/api';

export default function Maladies() {
  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState([]);
  const [suggestions, setSuggestions]   = useState([]);
  const [showSug, setShowSug]           = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

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
    try {
      const { data } = await api.get('/maladies', {
        params: { symptomes: query }
      });
      setResults(data);
      setShowSug(false);
    } catch (err) {
      console.error(err);
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

      {results.length === 0 ? (
        <p>Aucun résultat.</p>
      ) : (
        results.map((m, i) => (
          <div key={i} className="card">
            <h2>{m.Nom}</h2>
            <p><strong>Symptômes :</strong> {m.Symptomes}</p>
            <p><strong>Causes :</strong> {m.Causes}</p>
            <p><strong>Transmission :</strong> {m.Transmission}</p>
            <p><strong>Traitements :</strong> {m.Traitements}</p>
          </div>
        ))
      )}
    </div>
  );
}
