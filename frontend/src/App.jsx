import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import AdminLayout from './layouts/AdminLayout';
import { publicRoutes, protectedRoutes, adminRoutes } from './routes';

export default function App() {
  const { initialized, user } = useAuth();

  // 1. Initial Handshake with Backend
  if (!initialized) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  // 2. Global Ban Check
  // If user is banned, force them to Login regardless of where they try to go
  if (user?.banned) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* ─── PUBLIC ROUTES ─── */}
      {publicRoutes.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={
            user && (r.path === '/login' || r.path === '/register')
              ? <Navigate to="/dashboard" replace />
              : r.element
          }
        />
      ))}

      {/* ─── USER PROTECTED ROUTES ─── */}
      {/* UserProvider handles the real-time balance/ROI sync fixed in backend */}
      <Route
        element={
          user ? (
            <UserProvider>
              <ProtectedLayout />
            </UserProvider>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {protectedRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Route>

      {/* ─── ADMIN PROTECTED ROUTES ─── */}
      {/* Checks the fixed isAdmin boolean from our User.js model */}
      <Route
        element={
          user?.isAdmin || user?.role === 'admin' ? (
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

