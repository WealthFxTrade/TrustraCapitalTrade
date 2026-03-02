import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// Auth & Protection Protocols
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Layout Infrastructure
import MainLayout from './components/layout/MainLayout';

// ── LAZY LOADING PROTOCOLS ──
const Landing = lazy(() => import('./components/landing/Landing'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Signup'));

// User Dashboard Modules
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Withdraw = lazy(() => import('./pages/Dashboard/Withdraw'));
const Profile = lazy(() => import('./pages/Dashboard/Profile'));
const Invest = lazy(() => import('./pages/Dashboard/Invest'));
const KYCUpload = lazy(() => import('./pages/Dashboard/KYC'));

// Admin Oversight Modules
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const WithdrawalQueue = lazy(() => import('./pages/Admin/WithdrawalQueue')); // Synchronized

const TerminalLoading = () => (
  <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 border-2 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin" />
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/40">Syncing Node...</span>
  </div>
);

export default function App() {
  const location = useLocation();

  // ── ROUTE CHANGE SIDE-EFFECTS ──
  useEffect(() => {
    nprogress.start();
    nprogress.done();
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-yellow-500/30 relative overflow-x-hidden">
      
      {/* ── GLOBAL TERMINAL UI OVERLAY ── */}
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app')]" />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(10, 12, 16, 0.9)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            backdropFilter: 'blur(12px)',
          },
        }}
      />

      <Suspense fallback={<TerminalLoading />}>
        <Routes>
          {/* ── PUBLIC ACCESS ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── INVESTOR SECURE SECTOR ── */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/kyc" element={<KYCUpload />} />
          </Route>

          {/* ── SYSTEM OVERSIGHT (ADMIN) ── */}
          <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/queue" element={<WithdrawalQueue />} />
          </Route>

          {/* ── PROTOCOL FALLBACK ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

