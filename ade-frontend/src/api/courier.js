
import api from '../services/api';
export const createCourierProfile = data => api.post('/couriers', data);
export const toggleCourierAvailability = flag => api.put('/couriers/me/availability', { is_available: flag });