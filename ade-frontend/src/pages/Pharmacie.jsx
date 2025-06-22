import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Pharmacie() {
  const [pharmacies, setPharmacies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetchPharmacies(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setError('Impossible de récupérer votre position');
        setLoading(false);
      }
    );
  }, []);

  const fetchPharmacies = async (lat, lon) => {
    try {
      const { data } = await api.get('/pharmacies/near', { params: { lat, lon } });
      setPharmacies(data);
    } catch {
      setError('Erreur de chargement des pharmacies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Pharmacies à proximité</h1>
      {loading && <p>Chargement...</p>}
      {error && <p>{error}</p>}
      <div className="card-grid">
        {pharmacies.map((p, i) => (
          <div className="card" key={i}>
            <h2>{p.name}</h2>
            <p>{p.address}</p>
            {p.is_on_call && <span>De garde</span>}
          </div>
        ))}
      </div>
    </div>
  );
}