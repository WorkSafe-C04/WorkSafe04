import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante per inviare i cookie
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    //gestione token cn i cookie
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestione errori globale
    if (error.response?.status === 401) {
      // Redirect al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    } else if (error.response?.status === 403) {
      // Accesso negato - permessi insufficienti
      console.error('Accesso negato: permessi insufficienti');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;