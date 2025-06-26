import api from '../services/api';

export const interactiveSearch = (symptoms, responses = []) =>
  api.post('/maladies/interactive', { symptoms, responses });