import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:8000';

export const axiosClient = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 15000,
});

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        console.error('[API Error]:', message);
        return Promise.reject(error);
    }
);

export default axiosClient;
