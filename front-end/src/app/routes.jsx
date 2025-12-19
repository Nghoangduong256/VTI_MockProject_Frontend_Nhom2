import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ProfilePage from "../features/auth/pages/ProfilePage";
import SpendingSummaryPage from "../features/auth/pages/SpendingSummaryPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reigister" element={<RegisterPage />} />
      <Route path="/profiles" element={<ProfilePage />}></Route>
      <Route path="/spending-summary" element={<SpendingSummaryPage />}></Route>
    </Routes>
  );
}

export default AppRoutes;
