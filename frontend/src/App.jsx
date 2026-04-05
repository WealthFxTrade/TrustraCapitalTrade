// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Navigation Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';

// Layouts
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
import Withdrawal from './pages/Dashboard/WithdrawalForm';
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
      {/* Global Notification System */}
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
        {/* ====================== PUBLIC ROUTES ====================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ====================== PROTECTED UNIFIED LAYOUT ====================== */}
        {/* Both User and Admin routes live inside this Route group. 
            MainLayout will automatically detect the user's role 
            and swap the Sidebar/Theme dynamically.
        */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* --- User Space --- */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/deposit" element={<Deposit />} />
          <Route path="/dashboard/withdrawal" element={<Withdrawal />} />
          <Route path="/dashboard/profile" element={<UserProfile />} />
          <Route path="/dashboard/ledger" element={<Ledger />} />

          {/* --- Admin Space (Double Layer Protection) --- */}
          {/* Admin Index Redirect */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Navigate to="/admin/dashboard" replace />
              </AdminRoute>
            } 
          />
          
          <Route path="/admin/dashboard" element={<AdminRoute><AdminOverview /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUserTable /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><UserIdentityDetail /></AdminRoute>} />
          <Route path="/admin/withdrawals" element={<AdminRoute><WithdrawalRequestsTable /></AdminRoute>} />
          <Route path="/admin/deposits" element={<AdminRoute><DepositRequestsTable /></AdminRoute>} />
          <Route path="/admin/kyc" element={<AdminRoute><KycVerificationQueue /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/health" element={<AdminRoute><SystemHealth /></AdminRoute>} />
        </Route>

        {/* ====================== FALLBACK ====================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
