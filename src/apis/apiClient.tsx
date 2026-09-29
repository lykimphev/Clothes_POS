import axios from 'axios';

/**
 * កន្លែងកណ្តាលសម្រាប់ហៅ API ទៅកាន់ Laravel Backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    console.warn('API Error:', {
      status,
      message: data?.message || error.message,
      url: error.config?.url,
    });

    if (status == 401 || status == 403) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  },
);
export default apiClient;
