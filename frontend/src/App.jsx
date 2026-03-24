/**
 * TRUSTRA CAPITAL TRADE - MAIN APPLICATION ROUTER
 * Final Corrected Version: Includes all User & Admin nested routes.
 */

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
import Ledger from './pages/Dashboard/Ledger'; // ✅ Matches your Ledger.jsx file

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
      {/* Global Terminal-style Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#020408',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'monospace',
            fontSize: '12px',
          },
        }}
      />

      <Routes>
        {/* ── PUBLIC ROUTES ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />

        {/* ── USER SECURE NODE ROUTES (PROTECTED) ── */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          {/* UserLayout provides the Sidebar/Terminal UI */}
          <Route element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdrawal" element={<Withdrawal />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="ledger" element={<Ledger />} /> {/* ✅ Matches Sidebar Link */}
          </Route>
        </Route>

        {/* ── ADMIN CONTROL CENTER ROUTES (ADMIN ONLY) ── */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            {/* Default admin landing */}
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

        {/* ── CATCH-ALL REDIRECT ── */}
        {/* If a route is missing, redirect to home instead of showing a blank page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

