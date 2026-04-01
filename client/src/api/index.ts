import axios from 'axios';

const api = axios.create({ baseURL: '' });

api.interceptors.response.use(
  r => r,
  e => Promise.reject(e?.response?.data?.message || 'Request failed')
);

export default api;
