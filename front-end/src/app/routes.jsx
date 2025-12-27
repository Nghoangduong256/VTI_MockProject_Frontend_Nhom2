import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import DashboardPage from "../features/auth/pages/DashboardPage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import { useAuth } from "../features/auth/context/AuthContext";

function AppRoutes() {
    const { isAuthenticated, loading } = useAuth();

    // Hiển thị loading khi đang kiểm tra auth
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Root redirect - về dashboard nếu đã login, ngược lại về login */}
            <Route
                path="/"
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
            />

            {/* Login page */}
            <Route path="/login" element={<LoginPage />} />

            {/* Register page */}
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Dashboard route */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['USER']}>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default AppRoutes;
