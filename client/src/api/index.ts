import axios from 'axios';

const api = axios.create({ baseURL: '' });

api.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('seacare_user') || 'null');
  if (user?.id) config.headers['x-user-id'] = user.id;
  return config;
});

api.interceptors.response.use(
  r => r,
  e => Promise.reject(e?.response?.data?.message || 'Request failed')
);

export default api;
