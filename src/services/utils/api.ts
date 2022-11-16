import axios from 'axios';

const api = axios.create({
  baseURL: 'https://test.api.gsafra.com/',
});

export default api;
