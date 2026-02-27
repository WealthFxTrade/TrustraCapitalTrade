// src/App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

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

  // Prevents flicker during auth check
  if (!initialized) return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Landing Page: Wrapped in Layout if you want consistent Nav/Footer */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes: Standalone pages (No Layout wrapper to avoid double-bg) */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />}
        />
        
        {/* Protected Investment Routes */}
        <Route
          path="/invest"
          element={user ? <Layout><Invest /></Layout> : <Navigate to="/login" replace />}
        />

        {/* Global Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

