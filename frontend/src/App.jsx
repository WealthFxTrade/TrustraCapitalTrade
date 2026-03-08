// src/App.jsx
import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// ── AUTH & PROTECTION GATEKEEPERS ──
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// ── LAYOUTS ──
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './pages/Admin/AdminLayout';

// ── LAZY LOADED PUBLIC PAGES ──
const Landing = lazy(() => import('./components/landing/Landing'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Signup = lazy(() => import('./pages/Auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));

// ── LAZY LOADED USER PAGES (Zurich Mainnet Core) ──
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const NodeTiers = lazy(() => import('./pages/Nodes/NodeTiers'));
const Invest = lazy(() => import('./pages/Invest'));
const Exchange = lazy(() => import('./pages/Exchange/Exchange'));
const Withdraw = lazy(() => import('./pages/Withdraw/Withdraw'));
const Profile = lazy(() => import('./pages/Profile'));
const Compliance = lazy(() => import('./pages/Dashboard/KYC'));

// ── LAZY LOADED ADMIN PAGES ──
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminWithdrawals = lazy(() => import('./pages/Admin/AdminWithdrawals'));
const SystemHealth = lazy(() => import('./pages/Admin/SystemHealth'));
const GlobalLedger = lazy(() => import('./pages/Admin/GlobalLedger'));

/**
 * PageLoader - High-fidelity loading state for Zurich Mainnet
 */
const PageLoader = () => (
  <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
      </div>
    </div>
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-black text-yellow-500 tracking-[0.4em] uppercase italic">
        Zurich Mainnet
      </span>
      <span className="text-[10px] font-medium text-gray-600 tracking-widest uppercase">
        Synchronizing Node Assets...
      </span>
    </div>
  </div>
);

export default function App() {
  const location = useLocation();

  // ── NAVIGATION PROGRESS & SCROLL RESET ──
  useEffect(() => {
    nprogress.configure({ showSpinner: false, trickleSpeed: 200 });
    nprogress.start();
    const timer = setTimeout(() => {
      nprogress.done();
    }, 400);

    // Ensure user starts at the top of every new page
    window.scrollTo({ top: 0, behavior: 'instant' });

    return () => {
      clearTimeout(timer);
      nprogress.done();
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-yellow-500/30 relative overflow-x-hidden">
      
      {/* Visual Aesthetic: Grainy Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app')]" />

      {/* Global Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(10, 12, 16, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            fontSize: '14px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── 🔓 PUBLIC ROUTES ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── 🔐 PROTECTED USER VAULT ── */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nodes" element={<NodeTiers />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/exchange" element={<Exchange />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/compliance" element={<Compliance />} />
          </Route>

          {/* ── 👑 PROTECTED ADMIN TERMINAL ── */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="health" element={<SystemHealth />} />
            <Route path="ledger" element={<GlobalLedger />} />
          </Route>

          {/* ── 🚨 CATCH-ALL REDIRECT ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
