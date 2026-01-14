import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ProfilePage from "../features/auth/pages/ProfilePage";
import SpendingSummaryPage from "../features/auth/pages/SpendingSummaryPage";
import DashboardPage from "../features/auth/pages/DashboardPage";
import DepositPage from "../features/auth/pages/DepositPage";
import Withdraw from "../features/withdraw/Withdraw";
import ReceiveMoneyPage from "../features/auth/pages/ReceiveMoneyPage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import TransferHistoryPage from "../features/auth/pages/TransferHistoryPage";
import AdminTransactionHistoryPage from "../features/auth/pages/AdminTransactionHistoryPage";

import UserManagement from "../features/auth/pages/UserManagePage";
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
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/spending-summary"
        element={
          <ProtectedRoute>
            <SpendingSummaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receive-money"
        element={
          <ProtectedRoute>
            <ReceiveMoneyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfer-history"
        element={
          <ProtectedRoute>
            <TransferHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminTransactionHistoryPage />
        path="/user-manager"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
