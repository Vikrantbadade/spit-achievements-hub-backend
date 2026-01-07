import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUserInfo');
        // window.location.href = '/admin/login'; // This can be problematic if not carefully handled.
        // For now, let the component handle redirect via context or let it happen.
    }
    return Promise.reject(error);
});

export default api;
