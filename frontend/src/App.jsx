import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// Auth & Protection
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Layout
import MainLayout from './components/layout/MainLayout';

// 🚀 Lazy Loading for Performance (Vercel Optimization)
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Withdraw = lazy(() => import('./pages/Dashboard/Withdraw'));
const Profile = lazy(() => import('./pages/Dashboard/Profile'));
const Invest = lazy(() => import('./pages/Dashboard/Invest'));
const KYCUpload = lazy(() => import('./pages/Dashboard/KYC'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));

// 🛰️ LOADING COMPONENT
const TerminalLoading = () => (
  <div className="min-h-screen bg-[#020408] flex items-center justify-center">
    <div className="w-12 h-12 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
  </div>
);

export default function App() {
  const location = useLocation();

  // Trigger NProgress on route change
  React.useEffect(() => {
    nprogress.start();
    nprogress.done();
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-yellow-500/30 relative overflow-x-hidden">
      {/* Global Texture Overlay */}
      <div className="bg-grain fixed inset-0 pointer-events-none z-[100] opacity-20" />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#0a0c10',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            backdropFilter: 'blur(10px)',
          },
        }}
      />

      <Suspense fallback={<TerminalLoading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Terminal (Nested inside MainLayout via <Outlet />) */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/kyc" element={<KYCUpload />} />
          </Route>

          {/* Admin Terminal */}
          <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* 404 & Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
