import api from '../services/api';
export const updatePatientProfile = data => api.put('/patients/me', data);