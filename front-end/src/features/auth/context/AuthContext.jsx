import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

// Tạo Context
const AuthContext = createContext(null);

/**
 * AuthProvider - Wrap toàn bộ app để cung cấp authentication state
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Kiểm tra authentication khi component mount
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Kiểm tra user đã đăng nhập chưa
     */
    const checkAuth = async () => {
        try {
            if (authService.isAuthenticated()) {
                // Nếu có token, lấy thông tin user
                const userData = await authService.getCurrentUser();
                setUser(userData);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Đăng nhập
     */
    const login = async (credentials) => {
        setError(null);
        setLoading(true);
        try {
            const response = await authService.login(credentials);

            // Sau khi login thành công, lấy thông tin user
            if (response.token) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                return { success: true, data: response };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Đăng xuất
     */
    const logout = () => {
        authService.logout();
        setUser(null);
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook để sử dụng AuthContext
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export default AuthContext;
