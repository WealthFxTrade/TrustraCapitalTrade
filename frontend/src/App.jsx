// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Navigation Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';

// Layout
import MainLayout from './components/layout/MainLayout';

// Public Pages
import LandingPage from './components/landing/Landing';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// User Dashboard Pages
import UserDashboard from './pages/Dashboard/Dashboard';
import Deposit from './pages/Dashboard/Deposit';
import Withdrawal from './pages/Dashboard/Withdrawal';
import UserProfile from './pages/Dashboard/Profile';
import Ledger from './pages/Dashboard/Ledger';

// Admin Pages
import {
  AdminOverview,
  AdminUserTable,
  UserIdentityDetail,
  KycVerificationQueue,
  WithdrawalRequestsTable,
  DepositRequestsTable,
  AdminSettings,
  SystemHealth
} from './pages/Admin';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a0c10',
            color: '#fff',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '14px',
            padding: '16px',
            borderRadius: '12px',
          },
        }}
      />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================= PROTECTED LAYOUT ================= */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* -------- USER ROUTES -------- */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/deposit" element={<Deposit />} />
          <Route path="/dashboard/withdrawal" element={<Withdrawal />} />
          <Route path="/dashboard/profile" element={<UserProfile />} />
          <Route path="/dashboard/ledger" element={<Ledger />} />

          {/* -------- ADMIN ROUTES -------- */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminOverview />} />
            <Route path="/admin/users" element={<AdminUserTable />} />
            <Route path="/admin/users/:id" element={<UserIdentityDetail />} />
            <Route path="/admin/withdrawals" element={<WithdrawalRequestsTable />} />
            <Route path="/admin/deposits" element={<DepositRequestsTable />} />
            <Route path="/admin/kyc" element={<KycVerificationQueue />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/health" element={<SystemHealth />} />
          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
