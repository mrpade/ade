import { useState, useEffect } from 'react';
import icdApi from '../services/icdApi';

export default function SymptomSearch({ onSearch }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!input) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await icdApi.get('/symptoms', { params: { query: input } });
        // Ensure we always set an array
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch ICD suggestions', err);
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [input]);

  function selectSuggestion(s) {
    setInput(s.title);
    setSuggestions([]);
  }

  return (
    <div className="symptom-search">
      <input
        type="text"
        placeholder="Entrez un symptôme"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button onClick={() => onSearch(input)}>Rechercher</button>

      {Array.isArray(suggestions) && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map(s => (
            <li key={s.code} onClick={() => selectSuggestion(s)}>
              {s.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}