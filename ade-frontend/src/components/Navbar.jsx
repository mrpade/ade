import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('token');
  return (
    <nav className="navbar">
      <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>
        Accueil
      </NavLink>
      <NavLink to="/maladies" className={({isActive}) => isActive ? 'active' : ''}>
        Maladies
      </NavLink>
      
      {token
       ? <NavLink to="/moncompte">Mon compte</NavLink>
        : <>
           <NavLink to="/register">Inscription</NavLink>
           <NavLink to="/login">Connexion</NavLink>
          </>
     }
    </nav>
  );
}
