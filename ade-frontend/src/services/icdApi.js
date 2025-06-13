import axios from 'axios';

const base = import.meta.env.VITE_API_URL || '';
const icdApi = axios.create({
  baseURL: `${base}/api/icd`
});

export default icdApi;