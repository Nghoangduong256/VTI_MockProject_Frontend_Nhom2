import apiClient from '../../../services/apiClient';

/**
 * Auth Service - Xử lý tất cả các tác vụ liên quan đến authentication
 */
const authService = {
    /**
     * Đăng nhập
     * @param {object} credentials - { username, password }
     * @returns {Promise} Response từ API
     */
    login: async (credentials) => {
        try {
            // Map username to userName if needed, to match API requirement
            const payload = {
                userName: credentials.userName || credentials.username,
                password: credentials.password
            };
            const response = await apiClient.post('/api/auth/login', payload);

            // Lưu token và thông tin user vào localStorage
            if (response.data.token) {
                // Kiểm tra role trực tiếp từ response
                const roles = response.data.roles || [];
                // Allow USER or ADMIN
                if (roles.length > 0 && !roles.includes('USER') && !roles.includes('ADMIN')) {
                    throw {
                        response: {
                            data: {
                                message: 'Tài khoản không có quyền truy cập. Chỉ dành cho Customer hoặc Admin.'
                            }
                        }
                    };
                }

                localStorage.setItem('token', response.data.token);
                localStorage.setItem('tokenType', response.data.type || 'Bearer');

                // Lưu thêm expiresIn nếu có
                if (response.data.expiresIn) {
                    const expiresAt = Date.now() + response.data.expiresIn; // expiresIn is already in ms (86400000)
                    localStorage.setItem('tokenExpiresAt', expiresAt);
                }

                // Lưu user info trực tiếp từ response
                const user = {
                    username: response.data.userName || 'User',
                    email: response.data.email,
                    fullName: response.data.fullName,
                    avatar: response.data.avatar,
                    membership: response.data.membership || 'Free',
                    roles: roles
                };
                localStorage.setItem('user', JSON.stringify(user));
            }

            return response.data;
        } catch (error) {
            throw authService.handleError(error);
        }
    },

    /**
     * Parse JWT token helper
     */
    parseJwt: (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing JWT:', error);
            return null;
        }
    },

    /**
     * Đăng xuất
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('user');
    },

    /**
     * Lấy current token
     * @returns {string|null}
     */
    getToken: () => {
        return localStorage.getItem('token');
    },

    /**
     * Kiểm tra user đã đăng nhập hay chưa
     * @returns {boolean}
     */
    isAuthenticated: () => {
        const token = authService.getToken();
        if (!token) return false;

        // Kiểm tra token có hết hạn chưa
        const expiresAt = localStorage.getItem('tokenExpiresAt');
        if (expiresAt && Date.now() > parseInt(expiresAt)) {
            // authService.logout();
            return true;
        }

        return true;
    },

    /**
     * Lấy thông tin user từ localStorage hoặc API
     * @returns {Promise}
     */
    getCurrentUser: async () => {
        try {
            // Thử lấy từ localStorage trước
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                return JSON.parse(savedUser);
            }

            // Nếu backend có endpoint /me, uncomment đoạn code dưới
            // const response = await apiClient.get('/api/auth/me');
            // localStorage.setItem('user', JSON.stringify(response.data));
            // return response.data;

            // Fallback: Tạo user object từ token (basic info)
            const token = authService.getToken();
            if (token) {
                // Giả lập user info cơ bản
                // Trong production, bạn có thể decode JWT để lấy thông tin
                const user = {
                    username: 'User',
                    token: token,
                };
                localStorage.setItem('user', JSON.stringify(user));
                return user;
            }

            return null;
        } catch (error) {
            // Nếu endpoint /me không tồn tại, trả về user info cơ bản
            const token = authService.getToken();
            if (token) {
                const user = {
                    username: 'User',
                    token: token,
                };
                localStorage.setItem('user', JSON.stringify(user));
                return user;
            }
            throw authService.handleError(error);
        }
    },

    /**
     * Xử lý lỗi từ API
     * @param {object} error
     * @returns {object}
     */
    handleError: (error) => {
        if (error.response) {
            // Server trả về lỗi
            return {
                message: error.response.data.message || 'Đã xảy ra lỗi',
                status: error.response.status,
                data: error.response.data,
            };
        } else if (error.request) {
            // Request được gửi nhưng không nhận được response
            return {
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                status: 0,
            };
        } else {
            // Lỗi khác
            return {
                message: error.message || 'Đã xảy ra lỗi không xác định',
                status: -1,
            };
        }
    },
};

export default authService;
