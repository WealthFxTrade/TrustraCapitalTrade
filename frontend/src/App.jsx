// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './pages/Admin/AdminLayout';

// Public Pages
import LandingPage from './components/landing/Landing';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// User Pages
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
  SystemHealth,
} from './pages/Admin';

function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        {/* Public Routes - No Protection */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* User Routes */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/deposit" element={<Deposit />} />
          <Route path="/dashboard/withdrawal" element={<Withdrawal />} />
          <Route path="/dashboard/profile" element={<UserProfile />} />
          <Route path="/dashboard/ledger" element={<Ledger />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUserTable />} />
              <Route path="/admin/users/:id" element={<UserIdentityDetail />} />
              <Route path="/admin/deposits" element={<DepositRequestsTable />} />
              <Route path="/admin/withdrawals" element={<WithdrawalRequestsTable />} />
              <Route path="/admin/kyc" element={<KycVerificationQueue />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/health" element={<SystemHealth />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
