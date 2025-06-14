import api from '../services/api';

export const toggleAvailability  = flag => api.put('/doctors/me/availability', { is_available: flag });
export const createDoctorProfile = data => api.post('/doctors', data);
export const getAvailableDoctors = () => api.get('/doctors/available');


// Exemple d’usage dans DoctorDashboard.jsx
// const handleToggle = (e) => toggleAvailability(e.target.checked);