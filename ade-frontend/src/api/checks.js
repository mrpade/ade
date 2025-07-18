import api from '../services/api';

export const createCheck = (disease_id, symptoms, doctor_user_id) =>
  api.post('/checks', { disease_id, symptoms, doctor_user_id });

export const getDoctorChecks = () => api.get('/doctors/me/checks');

export const updateCheckAnswer = (id, answer) =>
  api.put(`/checks/${id}`, { answer });
