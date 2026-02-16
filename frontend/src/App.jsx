import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import AdminLayout from './layouts/AdminLayout';
import { publicRoutes, protectedRoutes, adminRoutes } from './routes';

export default function App() {
  const { initialized, user, loading } = useAuth();
  const location = useLocation();

  // 1. BLOCKING INITIALIZATION: 
  // Stay on the loading screen until AuthProvider finishes its profile check/refresh logic.
  if (!initialized || loading) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  // 2. GLOBAL SECURITY: Banned User Check
  if (user?.banned) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const isAdmin = user?.isAdmin || user?.role === 'admin';

  return (
    <Routes>
      {/* ─── PUBLIC ROUTES ─── */}
      {publicRoutes.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={
            // If logged in, don't let them go back to login/register
            user && (r.path === '/login' || r.path === '/register')
              ? <Navigate to="/dashboard" replace />
              : r.element
          }
        />
      ))}

      {/* ─── USER PROTECTED ROUTES ─── */}
      <Route
        element={
          user ? (
            <UserProvider>
              <ProtectedLayout />
            </UserProvider>
          ) : (
            // Crucial: Pass 'from' state so login knows where to return the user
            <Navigate to="/login" state={{ from: location }} replace />
          )
        }
      >
        {protectedRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Route>

      {/* ─── ADMIN PROTECTED ROUTES ─── */}
      <Route
        element={
          isAdmin ? (
            <AdminLayout />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      >
        {adminRoutes?.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Route>

      {/* ─── FALLBACK (404) ─── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

