import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import Withdraw from "../features/withdraw/Withdraw";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/withdraw" element={<Withdraw />} />
    </Routes>
  );
}

export default AppRoutes;
