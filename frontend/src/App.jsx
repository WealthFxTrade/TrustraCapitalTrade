// src/App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Signup = lazy(() => import('./pages/Auth/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Invest = lazy(() => import('./pages/Invest'));
const Layout = lazy(() => import('./components/layout/Layout'));

// Professional 2026 Trustra Loading State
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
    <div className="relative">
      <div className="w-20 h-20 border-2 border-yellow-500/20 rounded-full animate-ping absolute inset-0" />
      <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="mt-8 text-yellow-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
      Trustra Node: Syncing...
    </p>
  </div>
);

export default function App() {
  const { user, initialized } = useAuth();

  // Prevents UI flicker during initial token verification
  if (!initialized) return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Guest-only Routes: Redirect to dashboard if already logged in */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

        {/* ─── Protected Routes (Authenticated Users Only) ─── */}
        <Route element={<ProtectedRoute />}>
          {/* All routes inside here will automatically use the Layout wrapper */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invest" element={<Invest />} />
            {/* Add more internal pages here */}
          </Route>
        </Route>

        {/* Global Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
