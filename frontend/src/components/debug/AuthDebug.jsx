// src/components/debug/AuthDebug.jsx
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthDebug() {
  const { user, isAuthenticated, initialized, loading } = useAuth();

  if (import.meta.env.PROD) return null; // Hide in production

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 border border-emerald-500/30 rounded-xl p-4 text-xs text-gray-300 z-50 max-w-xs">
      <div className="font-black text-emerald-500 mb-2">AUTH DEBUG</div>
      <div>Initialized: <span className={initialized ? 'text-green-500' : 'text-red-500'}>{initialized ? 'YES' : 'NO'}</span></div>
      <div>Authenticated: <span className={isAuthenticated ? 'text-green-500' : 'text-red-500'}>{isAuthenticated ? 'YES' : 'NO'}</span></div>
      <div>Loading: <span className={loading ? 'text-yellow-500' : 'text-gray-500'}>{loading ? 'YES' : 'NO'}</span></div>
      <div>Role: <span className="text-white">{user?.role || 'None'}</span></div>
      <div className="mt-2 text-[10px] text-gray-500 break-all">
        User: {user?.email || 'Not logged in'}
      </div>
    </div>
  );
}
