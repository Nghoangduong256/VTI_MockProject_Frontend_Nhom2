import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import DepositPage from "../features/auth/pages/DepositPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/deposit" element={<DepositPage />} />
    </Routes>
  );
}

export default AppRoutes;
