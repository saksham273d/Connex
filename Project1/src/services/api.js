import axios from 'axios';

let api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      let currentPath = window.location.pathname;
      if (!['/login', '/register', '/forgot-password'].includes(currentPath)) {
        console.warn("401 Detected. Clearing session.");
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;