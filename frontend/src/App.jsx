// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Navigation Guards
import ProtectedRoute from './components/auth/ProtectedRoute'; // Verified path
import AdminRoute from './components/routing/AdminRoute';

// Public Pages
import LandingPage from './components/landing/Landing';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// User Dashboard Pages
import UserDashboard from './pages/Dashboard/Dashboard';
import Deposit from './pages/Dashboard/Deposit';
import Withdrawal from './pages/Dashboard/WithdrawalForm';
import UserProfile from './pages/Dashboard/Profile';
import Ledger from './pages/Dashboard/Ledger';

// Admin Pages
import {
  AdminDashboard,
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
        {/* ====================== PUBLIC PROTOCOLS ====================== */}
        {/* These routes MUST remain outside of any ProtectedRoute wrappers */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ====================== SECURE CLIENT TERMINAL ====================== */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/deposit" 
          element={
            <ProtectedRoute>
              <Deposit />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/withdrawal" 
          element={
            <ProtectedRoute>
              <Withdrawal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/ledger" 
          element={
            <ProtectedRoute>
              <Ledger />
            </ProtectedRoute>
          } 
        />

        {/* ====================== ADMINISTRATIVE GOVERNANCE ====================== */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="users" element={<AdminUserTable />} />
          <Route path="users/:id" element={<UserIdentityDetail />} />
          <Route path="withdrawals" element={<WithdrawalRequestsTable />} />
          <Route path="deposits" element={<DepositRequestsTable />} />
          <Route path="kyc" element={<KycVerificationQueue />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="health" element={<SystemHealth />} />
        </Route>

        {/* ====================== CATCH-ALL REDIRECT ====================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
