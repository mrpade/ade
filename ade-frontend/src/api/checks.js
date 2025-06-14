import api from '../services/api';

export const createCheck = (disease_id, symptoms, doctor_user_id) =>
  api.post('/checks', { disease_id, symptoms, doctor_user_id });
