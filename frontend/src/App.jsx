import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import AdminLayout from './layouts/AdminLayout';
import { publicRoutes, protectedRoutes, adminRoutes } from './routes';

export default function App() {
  const { isReady, user } = useAuth();
  const location = useLocation();

  // 1. Wait until auth initialization is fully complete
  if (!isReady) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  // 2. Global banned user check (immediate redirect if banned)
  if (user?.banned) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.isAdmin || user?.role === 'admin';

  return (
    <Routes location={location} key={location.pathname}>
      {/* ─── PUBLIC ROUTES ─── */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            // Redirect logged-in users away from login/register
            user && (route.path === '/login' || route.path === '/register') ? (
              <Navigate to="/dashboard" replace />
            ) : (
              route.element
            )
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
            <Navigate
              to="/login"
              replace
              state={{ from: location }} // helps redirect back after login
            />
          )
        }
      >
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>

      {/* ─── ADMIN PROTECTED ROUTES ─── */}
      <Route
        element={
          isAdmin ? (
            <AdminLayout />
          ) : user ? (
            // Logged-in but not admin → redirect to user dashboard
            <Navigate to="/dashboard" replace />
          ) : (
            // Not logged in → send to login
            <Navigate to="/login" replace />
          )
        }
      >
        {adminRoutes?.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>

      {/* ─── 404 FALLBACK ─── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
