import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ProfilePage from "../features/auth/pages/ProfilePage";
import SpendingSummaryPage from "../features/auth/pages/SpendingSummaryPage";
import DashboardPage from "../features/auth/pages/DashboardPage";
import DepositPage from "../features/auth/pages/DepositPage";
import Withdraw from "../features/withdraw/Withdraw";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deposit"
        element={
          <ProtectedRoute>
            <DepositPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/withdraw"
        element={
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        }
      />
      <Route path="/reigister" element={<RegisterPage />} />
      <Route path="/profiles" element={<ProfilePage />} />
      <Route path="/spending-summary" element={<SpendingSummaryPage />} />
    </Routes>
  );
}

export default AppRoutes;
