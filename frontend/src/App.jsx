import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorPortal from "./pages/DoctorPortal";
import AdminPanel from "./pages/AdminPanel";
import { getAuth } from "./hooks/useAuth";
import RegisterPage from "./pages/RegisterPage";


function RequireRole({ allowed, children }) {
  const { token, role } = getAuth();
  if(!token) return <Navigate to="/login" replace />;
  if(!allowed.includes(role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/patient"
        element={
          <RequireRole allowed={["PATIENT"]}>
            <PatientDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/doctor"
        element= {
          <RequireRole allowed={["DOCTOR"]}>
            <DoctorPortal />
          </RequireRole>
        }
      />

      <Route
        path="/admin"
        element= {
          <RequireRole allowed={["ADMIN"]}>
            <AdminPanel />
          </RequireRole>
        }
      />
    </Routes>
  );
}