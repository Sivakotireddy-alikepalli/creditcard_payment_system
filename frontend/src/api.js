import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
});

const paymentApi = axios.create({
    baseURL: 'http://localhost:8001',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
const authInterceptor = (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
};

api.interceptors.request.use(authInterceptor);
paymentApi.interceptors.request.use(authInterceptor);

// Auto-refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                try {
                    const { data } = await axios.post('http://localhost:8000/api/auth/token/refresh/', { refresh });
                    localStorage.setItem('access_token', data.access);
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;
                    return api(originalRequest);
                } catch {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export { api, paymentApi };

// Auth
export const authAPI = {
    register: (data) => api.post('/api/auth/register/', data),
    login: (data) => api.post('/api/auth/login/', data),
    logout: (refresh) => api.post('/api/auth/logout/', { refresh }),
    profile: () => api.get('/api/auth/profile/'),
    changePassword: (data) => api.post('/api/auth/change-password/', data),
};

// Cards
export const cardsAPI = {
    list: () => api.get('/api/cards/'),
    add: (data) => api.post('/api/cards/', data),
    delete: (id) => api.delete(`/api/cards/${id}/`),
    setDefault: (id) => api.patch(`/api/cards/${id}/`, { is_default: true }),
};

// Transactions
export const transactionsAPI = {
    list: (params) => api.get('/api/transactions/', { params }),
    create: (data) => api.post('/api/transactions/create/', data),
    detail: (id) => api.get(`/api/transactions/${id}/`),
    updateStatus: (refId, data) => api.patch(`/api/transactions/update-status/${refId}/`, data),
};

// Payments (FastAPI)
export const paymentsAPI = {
    process: (data) => paymentApi.post('/payments/process', data),
};

// Admin
export const adminAPI = {
    users: () => api.get('/api/admin-panel/users/'),
    updateUser: (id, data) => api.patch(`/api/admin-panel/users/${id}/`, data),
    deleteUser: (id) => api.delete(`/api/admin-panel/users/${id}/`),
    cards: () => api.get('/api/admin-panel/cards/'),
    transactions: (params) => api.get('/api/admin-panel/transactions/', { params }),
    dailySummary: () => api.get('/api/admin-panel/summary/daily/'),
    exportCSV: () => api.get('/api/admin-panel/transactions/export/csv/', { responseType: 'blob' }),
    logs: () => api.get('/api/admin-panel/logs/'),
};
