import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/freight',
});

export const uploadFile = (formData: FormData) => api.post('/upload', formData);
export const getMappings = () => api.get('/mappings');
export const getRecords  = () => api.get('/records');  

export default api;
