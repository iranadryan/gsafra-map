import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:3000',
  baseURL: 'http://testapi.gsafra.com',
});

export default api;
