// src/routing/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Pages
import Landing from '../components/landing/Landing';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';

// Protected Pages
import Dashboard from '../pages/Dashboard/Dashboard';

// Protected Route Wrapper
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* ====================== PUBLIC ROUTES ====================== */}
        
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ====================== PROTECTED ROUTES ====================== */}

        {/* User Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes (you can expand later) */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              {/* Replace with your actual Admin Dashboard component when ready */}
              <div className="min-h-screen bg-[#020408] flex items-center justify-center text-white">
                <div className="text-center">
                  <h1 className="text-4xl font-black tracking-tighter mb-4">Admin Dashboard</h1>
                  <p className="text-gray-400">Management Panel Coming Soon...</p>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* ====================== CATCH-ALL ====================== */}
        {/* Redirect unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
