import api from '../services/api';

export const fetchSymptoms = params => api.get('/admin/symptoms', { params });

export const fetchQuestions = params => api.get('/admin/questions', { params });
export const createQuestion = data => api.post('/admin/questions', data);
export const updateQuestion = (id, data) => api.put(`/admin/questions/${id}`, data);
export const deleteQuestion = id => api.delete(`/admin/questions/${id}`);

export const addOption = (questionId, data) => api.post(`/admin/questions/${questionId}/options`, data);
export const updateOption = (id, data) => api.put(`/admin/options/${id}`, data);
export const deleteOption = id => api.delete(`/admin/options/${id}`);

export const addImpact = (optionId, data) => api.post(`/admin/options/${optionId}/impacts`, data);
export const updateImpact = (id, data) => api.put(`/admin/impacts/${id}`, data);
export const deleteImpact = id => api.delete(`/admin/impacts/${id}`);

export const fetchOptions = symptomId =>
  api.get(`/admin/options/${symptomId}`);

export const fetchScores = symptomId => api.get(`/admin/scores/${symptomId}`);

export const fetchRelatedDiseases = symptomId =>
  api.get(`/admin/symptoms/${symptomId}/diseases`);

export const fetchDiseases = params => api.get('/admin/diseases', { params });
export const fetchDisease = id => api.get(`/admin/diseases/${id}`);
export const createDisease = data => api.post('/admin/diseases', data);
export const updateDisease = (id, data) => api.put(`/admin/diseases/${id}`, data);
