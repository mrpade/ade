import axios from 'axios';

const icdApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/icd'
});

export default icdApi;