import { useState } from 'react';

export default function QuestionCard({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  if (!question) return null;

  const handleSubmit = e => {
    e.preventDefault();
    if (selected) {
      onAnswer(selected);
      setSelected(null);
    }
  };

  return (
    <div className="question-card">
      <h2>{question.question_text}</h2>
      <form onSubmit={handleSubmit}>
        {question.options.map(opt => (
          <label key={opt.id} className="question-option">
            <input
              type="radio"
              name="option"
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => setSelected(opt.id)}
            />
            {opt.option_label}
          </label>
        ))}
        <button type="submit" disabled={!selected}>Valider</button>
      </form>
    </div>
  );
}
