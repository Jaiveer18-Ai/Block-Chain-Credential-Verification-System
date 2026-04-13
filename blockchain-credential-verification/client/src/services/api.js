import axios from 'axios';

const api = axios.create({
    // Detect environment: Use Render URL for production/mobile, local fallback for web dev
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

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
