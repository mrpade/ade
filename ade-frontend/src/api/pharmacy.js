// src/api/pharmacy.js
import api from '../services/api';
export const createPharmacyProfile = (payload) => api.post('/pharmacies', payload);
export const toggleOnCall = (flag) => api.put('/pharmacies/me/oncall', { is_on_call: flag });
export const getPharmacyProfile = () => api.get('/pharmacies/me');

// Exemple d’usage dans PharmacyDashboard.jsx
/*
createPharmacyProfile({
  name: 'Pharmacie de la Gare',
  address: 'Akwa, Rue Douala',
  latitude: 4.0507,            // facultatif si geolocation réussie
  longitude: 9.7670
});

toggleOnCall(true); // passe en pharmacie de garde
*/