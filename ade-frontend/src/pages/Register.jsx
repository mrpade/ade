// src/pages/Register.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    first_name: "",
    last_name: "",
    birthdate: "",
    // doctor
    speciality: "",
    onmc: "",
    workplace: "",
    bio: "",
    // pharmacy
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    // courier
    vehicle_type: "motorbike",
    plate_number: "",
    driver_license: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      // Appel à l'API d'inscription
      const { data } = await api.post('/auth/register', form);

      // Si l'API renvoie un token, on connecte directement
      if (data.token) {
        login(data.token, data.role);
        if (data.role === 'doctor')      navigate('/doctor');
          else if (data.role === 'pharmacy') navigate('/pharmacy');
          else if (data.role === 'courier')  navigate('/courier');
          else                               navigate('/moncompte');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur inscription');
    }
  };

  return (
    <div className="container">
      <div className="register-page">
        {/* Colonne gauche */}
        <aside className="register-page__aside">
          <h1>Bienvenue sur Ade Care</h1>
          <p>
            Créer un compte vous permet de bénéficier de toutes les
            fonctionnalités de notre application.
          </p>
        </aside>
        <section className="register-page__form">
          <h1>Inscription</h1>
          <form onSubmit={handleSubmit}>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Médecin</option>
              <option value="pharmacy">Pharmacie</option>
              <option value="courier">Livreur</option>
            </select>
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Nouveau mot de passe"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer mot de passe"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            />
            <PasswordStrengthMeter password={form.password} />
            <input
              name="first_name"
              placeholder="Prénom"
              value={form.first_name}
              onChange={handleChange}
            />
            <input
              name="last_name"
              placeholder="Nom"
              value={form.last_name}
              onChange={handleChange}
            />
            <input
              type="date"
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
            />

            {form.role === "doctor" && (
              <>
                <input
                  name="speciality"
                  placeholder="Spécialité"
                  value={form.speciality}
                  onChange={handleChange}
                  required
                />
                <input
                  name="onmc"
                  placeholder="Numéro ONMC"
                  value={form.onmc}
                  onChange={handleChange}
                  required
                />
                <input
                  name="workplace"
                  placeholder="Lieu d'exercice"
                  value={form.workplace}
                  onChange={handleChange}
                />
                <textarea
                  name="bio"
                  placeholder="Bio"
                  value={form.bio}
                  onChange={handleChange}
                />
              </>
            )}

            {form.role === "pharmacy" && (
              <>
                <input
                  name="name"
                  placeholder="Nom Pharmacie"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <input
                  name="address"
                  placeholder="Adresse"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
                <input
                  name="latitude"
                  placeholder="Latitude (opt.)"
                  value={form.latitude}
                  onChange={handleChange}
                />
                <input
                  name="longitude"
                  placeholder="Longitude (opt.)"
                  value={form.longitude}
                  onChange={handleChange}
                />
              </>
            )}

            {form.role === "courier" && (
              <>
                <select
                  name="vehicle_type"
                  value={form.vehicle_type}
                  onChange={handleChange}
                >
                  <option value="motorbike">Moto</option>
                  <option value="car">Voiture</option>
                  <option value="bicycle">Vélo</option>
                  <option value="other">Autre</option>
                </select>
                <input
                  name="plate_number"
                  placeholder="Immatriculation"
                  value={form.plate_number}
                  onChange={handleChange}
                />
                <input
                  name="driver_license"
                  placeholder="N° Permis"
                  value={form.driver_license}
                  onChange={handleChange}
                />
              </>
            )}

            <button type="submit">S'inscrire</button>
            {error && <p className="error">{error}</p>}
          </form>
        </section>
      </div>
    </div>
  );
}

/*<p className="register-page__form--info">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule,
              une minuscule et un chiffre.
            </p>*/