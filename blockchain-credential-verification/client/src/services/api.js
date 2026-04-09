import axios from 'axios';

const api = axios.create({
    baseURL: '/api' 
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
