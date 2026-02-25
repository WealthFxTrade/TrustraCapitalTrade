import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

// Components from your directory
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import AccountSummary from './AccountSummary';
import NodeMarketplace from './NodeMarketplace';
import TransactionLedger from './TransactionLedger';
import SchemaLogs from './SchemaLogs'; // Security/Activity Logs
import WithdrawalForm from './WithdrawalForm';

export default function Dashboard() {
  const { user, initialized } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Centralized Data Fetching
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetches main balance, profit, and active plan in one go
        const res = await api.get('/dashboard/stats');
        setStats(res.data || {});
      } catch (err) {
        console.error('[Dashboard Sync Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // 2. Security Guard
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-yellow-500/30">
      
      {/* ─── GLOBAL HEADER ─── */}
      {/* We pass stats here so the balance in the header updates live */}
      <DashboardHeader stats={stats} loading={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-10 py-12">
        <Routes>
          {/* ─── HOME: OVERVIEW ─── */}
          <Route 
            path="/" 
            element={<AccountSummary stats={stats} loading={loading} />} 
          />

          {/* ─── NODES: DEPLOYMENT ─── */}
          <Route 
            path="/nodes" 
            element={<NodeMarketplace userBalance={stats?.mainBalance} />} 
          />

          {/* ─── FINANCE: LEDGER & WITHDRAWALS ─── */}
          <Route path="/history" element={<TransactionLedger />} />
          <Route 
            path="/withdraw" 
            element={<WithdrawalForm availableBalance={stats?.mainBalance} />} 
          />

          {/* ─── SECURITY: SYSTEM LOGS ─── */}
          <Route path="/logs" element={<SchemaLogs />} />

          {/* ─── FALLBACK ─── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* ─── NETWORK FOOTER ─── */}
      <footer className="max-w-7xl mx-auto px-10 py-8 border-t border-white/5 opacity-20 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">
          Zurich Financial Hub • Secure Node Connection Active • v8.4.1
        </p>
      </footer>
    </div>
  );
}

