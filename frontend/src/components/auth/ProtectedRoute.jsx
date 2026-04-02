import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2 } from 'lucide-react';

/**
 * TRUSTRA CAPITAL | SECURITY GATEKEEPER
 * Manages encrypted access to the Capital Terminal and Governance Command.
 * * @param {boolean} adminOnly - Restricts node access to administrative accounts.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, initialized } = useAuth();
  const location = useLocation();

  // ── 1. PROTOCOL INITIALIZATION (SPLASH) ──
  // Prevents "Unauthorized" false-positives during session handshake.
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative flex items-center justify-center"
        >
          <div className="w-16 h-16 border-2 border-emerald-500/10 rounded-full" />
          <div className="absolute w-16 h-16 border-t-2 border-emerald-500 rounded-full" />
        </motion.div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 animate-pulse">
          Synchronizing Security Node...
        </div>
      </div>
    );
  }

  // ── 2. IDENTITY VERIFICATION ──
  // If no session exists, redirect to login and preserve intended destination.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── 3. GOVERNANCE CLEARANCE (ADMIN CHECK) ──
  // Blocks non-admin users from accessing sensitive ledger controls.
  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0a0c10] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-rose-500">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-3">
            Clearance Level Error
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-relaxed mb-10 px-4">
            Identity validated but protocol access denied. Your current credentials do not hold 
            administrative governance permissions for this sector.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all active:scale-95"
          >
            Return to Authorized Zone
          </button>
        </motion.div>
      </div>
    );
  }

  // ── 4. ACCESS GRANTED ──
  return children;
}
