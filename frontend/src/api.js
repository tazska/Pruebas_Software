import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  }
};

export const products = {
  getAll: async () => {
    const res = await api.get('/products');
    return res.data;
  },
  getOne: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/products', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  }
};

export default api;
