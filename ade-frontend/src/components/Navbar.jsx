import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logofullade.png';
import '../components/Navbar.css';

export default function Navbar() {
  const { token, role, logout } = useContext(AuthContext);
  const dashboardLink =
    role === 'doctor' ? '/doctor'
    : role === 'pharmacy' ? '/pharmacy'
    : role === 'courier' ? '/courier'
    : role === 'admin' ? '/admin' : '/patient';

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <NavLink to="/" className="navbar__logo">
          <img src={logo} alt="ADE CARE" />
        </NavLink>
      </div>

      <div className="navbar__center">
        <NavLink to="/maladies" className="navbar__link">Diagnostic</NavLink>
        <NavLink to="/consultation" className="navbar__link">Consultation</NavLink>
        <NavLink to="/pharmacie" className="navbar__link">e-Pharmacie</NavLink>
        {token && role === 'admin' && (
          <NavLink to="/admin" className="navbar__link">Administration</NavLink>
        )}
        {token && (
          <NavLink to={dashboardLink} className="navbar__link">Mon compte</NavLink>
        )}
      </div>

      <div className="navbar__right">
        {!token ? (
          <>
            <NavLink to="/register" className="navbar__link sign-up">S’inscrire</NavLink>
            <NavLink to="/login" className="navbar__button green">Se connecter</NavLink>
          </>
        ) : (
          <button onClick={handleLogout} className="navbar__button pink">Déconnexion</button>
        )}
      </div>
    </nav>
  );
}
