import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import AdminLayout from './layouts/AdminLayout'; // Assuming you have an Admin Layout
import { publicRoutes, protectedRoutes, adminRoutes } from './routes';

export default function App() {
  const { initialized, user } = useAuth();

  if (!initialized) {
    return <LoadingScreen message="Securing Trustra Node..." />;
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
      <Route
        element={
          user?.isAdmin ? (
            <AdminLayout />
          ) : (
            <Navigate to="/dashboard" replace /> // Kick non-admins back to user dash
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
