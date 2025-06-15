import api from '../services/api';

export const updatePatientProfile = data => api.put('/patients/me', data);
export const getPatientProfile = () => api.get('/patient/profile');
export const getPatientChecks = () => api.get('/patient/checks');
export const getPatientAppointments = () => api.get('/patient/appointments');
