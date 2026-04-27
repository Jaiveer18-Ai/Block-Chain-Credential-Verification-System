import axios from 'axios';

const api = axios.create({
    // Dynamically set baseURL: 
    // If accessing via IP (Android), use VITE_API_URL
    // If accessing via localhost, ensure it points to the correct place
    baseURL: import.meta.env.VITE_API_URL
});

// Interceptor to handle any dynamic URL logic if needed in the future
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const parsed = JSON.parse(userInfo);
        if (parsed.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
        }
    }
    return config;
});

export default api;
