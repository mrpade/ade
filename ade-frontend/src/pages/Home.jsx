// Home.jsx
import { NavLink } from 'react-router-dom';
import diagImg from '../assets/diag.png';
import consultImg from '../assets/consult.png';
import pharmaImg from '../assets/pharma.png';
import deliveryImg from '../assets/delivery.png';
import arrow from '../assets/arrow-right-circle.svg'
import '../pages/Home.css';

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1><strong>Parce que <span className="highlight">votre santé mérite mieux</span> qu’une attente de 2 heures</strong></h1>
        <p>
          Faites une auto-évaluation de vos symptômes, demandez une vérification à un médecin à distance et commandez vos médicaments en toute simplicité,
          sans quitter votre domicile.
        </p>
      </section>

      <section className="features">
        <div className="feature-card">
          <img src={diagImg} alt="Diagnostic" />
          <NavLink to="/maladies" className="btn">
          Diagnostic intelligent
          <img src={arrow} alt=""className='arrow-icon'/>
          </NavLink>
        </div>
        <div className="feature-card">
          <img src={consultImg} alt="Consultation" />
          <NavLink to="/consultation" className="btn">
            Consultation
            <img src={arrow} alt=""className='arrow-icon'/>
          </NavLink>
        </div>
        <div className="feature-card">
          <img src={pharmaImg} alt="Commander" />
          <NavLink to="/pharmacie" className="btn">
          Commander
          <img src={arrow} alt=""className='arrow-icon'/>
          </NavLink>
        </div>
        <div className="feature-card">
          <img src={deliveryImg} alt="Livraison" />
          <NavLink to="/livraison" className="btn">
          Livraison
          <img src={arrow} alt=""className='arrow-icon'/>
          </NavLink>
        </div>
      </section>
    </div>
  );
}

