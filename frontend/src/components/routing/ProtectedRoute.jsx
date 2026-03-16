import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * 🔒 PROTECTED ROUTE GATEWAY
 * Only allows access to authenticated nodes.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth();
  const location = useLocation();

  // 1. 🕒 Wait for the 7s Auth Handshake to complete
  if (!initialized) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#020408]">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#d4af37]"></div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.3em] text-gray-500 uppercase">
          Synchronizing Node...
        </p>
      </div>
    );
  }

  // 2. 🚫 Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. ✅ Render protected content (UserLayout)
  return children;
}

