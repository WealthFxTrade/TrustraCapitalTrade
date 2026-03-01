import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth & Protection
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Layout
import MainLayout from './components/layout/MainLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Signup'; // Ensure filename is Signup.jsx

// Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Withdraw from './pages/Dashboard/Withdraw';
import Profile from './pages/Dashboard/Profile';
import Invest from './pages/Dashboard/Invest';
import KYCUpload from './pages/Dashboard/KYC'; // Path: src/pages/Dashboard/KYC.jsx

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-yellow-500/30 relative overflow-x-hidden">
      {/* Global Texture Overlay */}
      <div className="bg-grain fixed inset-0 pointer-events-none z-[100] opacity-20" />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#0a0c10',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Terminal */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/kyc" element={<KYCUpload />} />
        </Route>

        {/* Admin Terminal */}
        <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* 404 & Redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
