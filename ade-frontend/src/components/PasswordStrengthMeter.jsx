// src/components/PasswordStrengthMeter.jsx
import React from "react";

// Determine score: 0 to 5
export function calculatePasswordScore(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function PasswordStrengthMeter({ password }) {
  const score = calculatePasswordScore(password);
  const percent = (score / 5) * 100;
  let color = "#e74c3c"; // red
  if (score >= 4) color = "#2ecc71"; // green
  else if (score >= 3) color = "#f1c40f"; // yellow

  return (
    <div className="password-strength">
      <div
        className="strength-bar"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
      <p className="strength-text">
        {score === 5 && "Très fort"}
        {score === 4 && "Fort"}
        {score === 3 && "Moyen"}
        {score === 2 && "Faible"}
        {score <= 1 && "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."}
      </p>
    </div>
  );
}
