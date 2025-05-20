import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logofullade.png';

export default function Navbar() {
  const { token, role, logout } = useContext(AuthContext);
  const dashboardLink = role === 'doctor' ? '/doctor'
                      : role === 'pharmacy' ? '/pharmacy' 
                      : role === 'courier' ? '/courier' 
                      : '/moncompte';
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__logo">
        <img src={logo} alt="ADE CARE" />
      </NavLink>

      <div className="navbar__links">
      
        <NavLink to="/maladies" className="navbar__link">Maladies</NavLink>

        {!token ? (
          <>
            <NavLink to="/register" className="navbar__link">Inscription</NavLink>
            <NavLink to="/login" className="navbar__link--button">Connexion</NavLink>
          </>
        ) : (
          <>
            <NavLink to={dashboardLink} className="navbar__link">Mon compte</NavLink>
            <button onClick={handleLogout}
              className="navbar__link--button">
              Déconnexion
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

