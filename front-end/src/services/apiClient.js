import axios from 'axios';

// Base URL cho API
const API_BASE_URL = 'http://localhost:8080';

// Tạo axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor - Tự động thêm JWT token vào headers
apiClient.interceptors.request.use(
    (config) => {
        console.log('🚀 API Request:', {
            url: config.url,
            method: config.method,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            data: config.data,
        });

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Token attached');
        }
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý lỗi global
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
        });
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });

        // Nếu token hết hạn hoặc không hợp lệ (401)
        if (error.response && error.response.status === 401) {
            console.warn('⚠️ Unauthorized - Logging out');
            // Xóa token và redirect về login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Check CORS error
        if (!error.response) {
            console.error('🚫 Network Error - Có thể là CORS issue hoặc backend không chạy');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
