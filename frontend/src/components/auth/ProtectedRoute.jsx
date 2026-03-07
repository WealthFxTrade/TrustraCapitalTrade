// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // This now works after fix above

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
