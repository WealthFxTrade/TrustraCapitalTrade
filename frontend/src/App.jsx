import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Login from "./pages/Auth/Login.jsx";
import Signup from "./pages/Auth/Signup.jsx";
import LandingPage from "./pages/Landing.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { user, initialized } = useAuth();

  // Prevents the "Flash of Unauthenticated Content"
  if (!initialized) return null; 

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      {/* Protected Dashboard - Uses wildcard * for nested sub-routes */}
      <Route
        path="/dashboard/*"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

