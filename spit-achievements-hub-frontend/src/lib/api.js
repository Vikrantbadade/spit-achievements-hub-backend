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
        // Check for either token. Priority doesn't matter much as usually only one exists.
        // If both exist, we might default to authToken, but for admin specific routes, it might be an issue.
        // However, in this app structure, they seem distinct.
        const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
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
        // Unwrap ApiResponse if present
        if (response.data && response.data.success && response.data.data !== undefined) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized access - clearing session.");
            // Clear both potential tokens to be safe
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUserInfo');

            // Optional: Redirect to login if needed, or let the UI components react to the cleared state
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
