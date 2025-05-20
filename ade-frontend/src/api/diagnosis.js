import api from '../services/api';
export const createDiagnosis = (disease_id, symptoms) => api.post('/diagnoses', { disease_id, symptoms });
export const getMyDiagnoses  = () => api.get('/diagnoses/me');