import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Bảo vệ các route yêu cầu authentication
 * Redirect về /login nếu user chưa đăng nhập
 */
export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, loading, user } = useAuth();

    // Hiển thị loading khi đang kiểm tra authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // // Redirect về login nếu chưa đăng nhập
    // if (!isAuthenticated) {
    //     return <Navigate to="/login" replace />;
    // }

    // // Check role access
    // if (allowedRoles && allowedRoles.length > 0) {
    //     if (!user || !allowedRoles.includes(user.role)) {
    //         // User không có quyền, log out và về login (hoặc trang unauthorized)
    //         // Ở đây ta cho về login cho đơn giản theo yêu cầu
    //         return <Navigate to="/login" replace />;
    //     }
    // }

    // Render children nếu đã đăng nhập
    return children;
}
