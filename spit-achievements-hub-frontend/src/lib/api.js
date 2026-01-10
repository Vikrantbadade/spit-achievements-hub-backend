import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: '/api/v1', // Proxy is set in vite.config.ts usually, or this points to relative path
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token header to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Optional: Handle 401 specifically if you want auto-logout
        if (error.response && error.response.status === 401) {
            // You might want to trigger a logout action here or emit an event
            // For now detailed handling can be done in components
            console.error("Unauthorized access, token might be invalid/expired.");
        }
        return Promise.reject(error);
    }
);

export default api;
