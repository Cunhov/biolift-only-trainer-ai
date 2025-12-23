import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const auth = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
};

export const workouts = {
    create: (data: any) => api.post('/workouts', data),
    getAll: () => api.get('/workouts'),
    getOne: (id: string) => api.get(`/workouts/${id}`),
    delete: (id: string) => api.delete(`/workouts/${id}`),
    update: (id: string, data: any) => api.put(`/workouts/${id}`, data),
};

export const ai = {
    // For SSE we don't use axios, but we can have a helper here if needed.
    // The frontend will likely use EventSource directly.
};

export default api;
