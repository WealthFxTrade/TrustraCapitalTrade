// src/components/auth/AdminRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * 👑 AdminRoute - Production v8.6
 * Enforces Role-Based Access Control (RBAC) for the Zurich Mainnet Admin Terminal.
 */
export default function AdminRoute({ children }) {
  const { user, isAuthenticated, initialized } = useAuth();
  const location = useLocation();

  // 1. Authorization Initialization: Wait for JWT validation
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-500 tracking-[0.2em] uppercase">
          Verifying Admin Credentials...
        </span>
      </div>
    );
  }

  // 2. Authentication Check: If no session exists, send to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role Check: If user is not an 'admin', redirect to User Dashboard
  if (user.role !== 'admin') {
    console.warn(`🚫 UNAUTHORIZED ACCESS: ${user.email} attempted to reach ${location.pathname}`);
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Access Granted: Render Admin Layout and children
  return children;
}
