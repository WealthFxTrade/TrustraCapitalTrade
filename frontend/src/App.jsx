// src/App.jsx - FULLY CORRECTED & UNSHORTENED VERSION (March 2026)
// Clean routing, proper nesting, and admin access fixed

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ── AUTH & ROUTE GUARDS ──────────────────────────────────────
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';

// ── PUBLIC PAGES ─────────────────────────────────────────────
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import LandingPage from './components/landing/Landing';

// ── USER DASHBOARD & LAYOUT ──────────────────────────────────
import UserLayout from './components/layout/ProtectedLayout';
import UserDashboard from './pages/Dashboard/Dashboard';
import Deposit from './pages/Dashboard/Deposit';
import Withdrawal from './pages/Dashboard/WithdrawalForm';
import UserProfile from './pages/Dashboard/Profile';
import Ledger from './pages/Dashboard/Ledger';

// ── ADMIN DASHBOARD & LAYOUT ─────────────────────────────────
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminWithdrawals from './pages/Admin/AdminWithdrawals';
import AdminKYC from './pages/Admin/AdminKYC';
import GlobalLedger from './pages/Admin/GlobalLedger';
import SystemHealth from './pages/Admin/SystemHealth';
import AdminSupport from './pages/Admin/AdminSupport';

function App() {
  return (
    <>
      {/* Global Toast Notifications - Terminal Style */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#020408',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#eab308', secondary: '#020408' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#020408' },
          },
        }}
      />

      <Routes>
        {/* ── PUBLIC ROUTES ──────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />

        {/* ── USER SECURE NODE ROUTES (Protected) ─────────────────── */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          {/* UserLayout wraps all user dashboard pages with sidebar */}
          <Route element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdrawal" element={<Withdrawal />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="ledger" element={<Ledger />} />
          </Route>
        </Route>

        {/* ── ADMIN CONTROL CENTER ROUTES (Admin Only) ───────────── */}
        <Route path="/admin" element={<AdminRoute />}>
          {/* AdminLayout wraps all admin pages */}
          <Route element={<AdminLayout />}>
            {/* Default redirect when visiting /admin */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="kyc" element={<AdminKYC />} />
            <Route path="ledger" element={<GlobalLedger />} />
            <Route path="health" element={<SystemHealth />} />
            <Route path="support" element={<AdminSupport />} />
          </Route>
        </Route>

        {/* ── CATCH-ALL: Redirect unknown routes to Landing Page ─── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
