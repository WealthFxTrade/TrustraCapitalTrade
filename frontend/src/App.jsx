// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth & Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Signup';

// Landing Page
import LandingPage from './components/landing/Landing';

// User Dashboard & Layout
import UserLayout from './components/layout/ProtectedLayout';
import UserDashboard from './pages/Dashboard/Dashboard';
import Deposit from './pages/Dashboard/Deposit';
import Withdrawal from './pages/Dashboard/WithdrawalForm';
import UserProfile from './pages/Dashboard/Profile';

// Admin Dashboard & Layout
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
      {/* Global Toast Notifications */}
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
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Routes – Protected */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          {/* Nested layout inside ProtectedRoute */}
          <Route element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdrawal" element={<Withdrawal />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Admin Routes – Admin-only */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
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

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
