import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // ⚡ Removed Router import
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Signup';
import LandingPage from './components/landing/Landing';
import UserLayout from './components/layout/ProtectedLayout';
import UserDashboard from './pages/Dashboard/Dashboard';
import Deposit from './pages/Dashboard/Deposit';
import Withdrawal from './pages/Dashboard/WithdrawalForm';
import UserProfile from './pages/Dashboard/Profile';
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
      {/* ⚡ Router tags REMOVED here because they are already in main.jsx */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#020408',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'monospace',
            fontSize: '12px'
          }
        }}
      />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route index element={<UserDashboard />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdrawal" element={<Withdrawal />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="kyc" element={<AdminKYC />} />
          <Route path="ledger" element={<GlobalLedger />} />
          <Route path="health" element={<SystemHealth />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

