import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// ── AUTH & PROTECTION PROTOCOLS ──
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// ── LAYOUT INFRASTRUCTURE ──
import MainLayout from './components/layout/MainLayout';

// ── LAZY LOADING PROTOCOLS (MASTER FILE PATHS) ──
const Landing = lazy(() => import('./components/landing/Landing'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Signup'));

// User Terminal Modules - Consolidated to Master Paths
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Withdraw = lazy(() => import('./pages/Withdraw/Withdraw')); // New consolidated path
const Invest = lazy(() => import('./pages/Invest'));              // New Rio v8.6 Master
const Profile = lazy(() => import('./pages/Profile'));            // Root pages path
const KYCUpload = lazy(() => import('./pages/Dashboard/KYC'));

// Admin Oversight Modules
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const WithdrawalQueue = lazy(() => import('./pages/Admin/WithdrawalQueue'));

/**
 * @component TerminalLoading
 * @description Renders a high-fidelity loading state during node synchronization.
 */
const TerminalLoading = () => (
  <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 border-2 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin" />
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/40">
      Syncing Rio Node...
    </span>
  </div>
);

export default function App() {
  const location = useLocation();

  /**
   * @description Handles visual feedback (NProgress) and scroll reset on route changes.
   */
  useEffect(() => {
    nprogress.start();
    nprogress.done();
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-yellow-500/30 relative overflow-x-hidden">
      
      {/* ── GLOBAL TERMINAL UI OVERLAY (Grain Effect) ── */}
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app')]" />

      {/* ── NOTIFICATION ENGINE ── */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(10, 12, 16, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            backdropFilter: 'blur(20px)',
          },
        }}
      />

      <Suspense fallback={<TerminalLoading />}>
        <Routes>
          {/* ── PUBLIC ACCESS SECTOR ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── SECURE INVESTOR SECTOR ── */}
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/kyc" element={<KYCUpload />} />
          </Route>

          {/* ── SYSTEM OVERSIGHT SECTOR (ADMIN ONLY) ── */}
          <Route element={
            <AdminRoute>
              <MainLayout />
            </AdminRoute>
          }>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/queue" element={<WithdrawalQueue />} />
          </Route>

          {/* ── PROTOCOL FALLBACK (404 REDIRECT) ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
