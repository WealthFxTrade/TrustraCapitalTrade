import React, { useState, useEffect, useCallback, useRef } from 'react';
import Deposit from './Deposit.jsx';
import Withdrawal from './Withdrawal.jsx';
import Invest from './Invest.jsx';
import Ledger from './Ledger.jsx';
import Profile from './Profile.jsx';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Loader2, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { user, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState('Invest');
  const isSyncing = useRef(false);

  // Core Financial State
  const [balances, setBalances] = useState({ EUR: 0, ROI: 0, BTC: 0 });
  const [transactions, setTransactions] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalAUM: 0,
    health: 'Operational'
  });
  const [pendingKYCs, setPendingKYCs] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Universal Sync: Fetches balances, stats, and transactions
   * Final version - optimized for flattened backend response
   */
  const syncNodeData = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    setLoading(true);

    try {
      const res = await api.get(API_ENDPOINTS.USER.STATS);
      
      if (res.data?.success) {
        const data = res.data;

        // Direct mapping from new flat fields returned by backend
        setBalances({
          EUR: Number(data.availableBalance || data.principal || 0),
          ROI: Number(data.accruedROI || 0),
          BTC: Number(data.btcBalance || 0),
        });

        // Update transactions
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }

        console.log('✅ Dashboard synced - Flat data received:', {
          principal: data.principal,
          availableBalance: data.availableBalance,
          accruedROI: data.accruedROI,
          btcBalance: data.btcBalance,
          fullResponseKeys: Object.keys(data)
        });
      } else {
        console.warn('⚠️ Unexpected stats response:', res.data);
      }
    } catch (err) {
      console.error("❌ Dashboard Sync Error:", err.response?.data || err.message);
      if (document.visibilityState === 'visible') {
        toast.error('Failed to sync vault data');
      }
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, []);

  /**
   * Admin-Only Metrics Fetch
   */
  const fetchAdminData = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const [statsRes, kycRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.HEALTH),
        api.get(`${API_ENDPOINTS.ADMIN.USERS}?kyc=pending`),
      ]);

      if (statsRes.data.success) {
        setAdminStats(statsRes.data.data || statsRes.data.stats || {});
      }
      if (kycRes.data.success) {
        setPendingKYCs(kycRes.data.users || []);
      }
    } catch (err) {
      console.error("Admin Fetch Error:", err);
    }
  }, [user?.role]);

  // Auto-sync on mount and every 30 seconds
  useEffect(() => {
    if (user) {
      syncNodeData();
      if (user.role === 'admin') fetchAdminData();

      const interval = setInterval(() => {
        syncNodeData();
        if (user.role === 'admin') fetchAdminData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, syncNodeData, fetchAdminData]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Invest':
        return <Invest balances={balances} refreshBalances={syncNodeData} />;
      case 'Ledger':
        return <Ledger transactions={transactions} refreshBalances={syncNodeData} />;
      case 'Deposit':
        return <Deposit refreshBalances={syncNodeData} />;
      case 'Withdraw':
        return <Withdrawal balances={balances} refreshBalances={syncNodeData} />;
      case 'Profile':
        return <Profile refreshSession={refreshSession} />;
      case 'AdminStats':
        return user?.role === 'admin' ? renderAdminView() : null;
      default:
        return null;
    }
  };

  const renderAdminView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
        <h3 className="font-black uppercase text-[10px] text-emerald-500 mb-6 tracking-[0.2em]">Global Vault Metrics</h3>
        <div className="space-y-4 text-sm font-medium">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-gray-500 uppercase text-[10px]">Total Users</span>
            <span className="font-black italic">{adminStats.totalUsers || 0}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-gray-500 uppercase text-[10px]">Total AUM</span>
            <span className="font-black italic text-emerald-400">€{adminStats.totalAUM?.toLocaleString('de-DE') || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 uppercase text-[10px]">Health</span>
            <span className="font-black italic text-blue-400">{adminStats.health || 'Operational'}</span>
          </div>
        </div>
      </div>
      <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
        <h3 className="font-black uppercase text-[10px] text-amber-500 mb-6 tracking-[0.2em]">KYC Queue</h3>
        {pendingKYCs.length === 0 ? (
          <p className="text-gray-500 text-xs italic">All identities verified.</p>
        ) : (
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {pendingKYCs.map((k) => (
              <div key={k._id} className="text-[10px] bg-white/5 p-4 rounded-xl flex justify-between items-center border border-white/5">
                <span className="font-bold">{k.name} <span className="text-gray-500 lowercase ml-1">({k.email})</span></span>
                <span className="text-amber-500 font-black uppercase tracking-tighter">Pending Review</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 selection:bg-emerald-500 selection:text-black">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Vault <span className="text-emerald-500">Dashboard</span></h1>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">
            Institutional Node: <span className="text-white italic ml-2">{user?.fullName || user?.name || 'Anonymous Client'}</span>
          </p>
        </div>

        <button
          onClick={syncNodeData}
          disabled={loading}
          className="group flex items-center gap-3 px-8 py-4 bg-emerald-500 text-black rounded-2xl hover:bg-emerald-400 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={16} />}
          {loading ? 'Syncing...' : 'Sync Vault Node'}
        </button>
      </header>

      <nav className="flex gap-2 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {['Invest', 'Ledger', 'Deposit', 'Withdraw', 'Profile']
          .concat(user?.role === 'admin' ? ['AdminStats'] : [])
          .map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                activeTab === tab
                ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
      </nav>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-10 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-4">Total Principal</p>
          <p className="text-4xl font-black italic tracking-tighter">
            €{(balances.EUR || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </p>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-white/[0.02] rounded-full group-hover:scale-150 transition-transform duration-700" />
        </div>

        <div className="p-10 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em] mb-4">Accrued ROI</p>
          <p className="text-4xl font-black italic text-emerald-400 tracking-tighter">
            €{(balances.ROI || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </p>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-emerald-500/[0.02] rounded-full group-hover:scale-150 transition-transform duration-700" />
        </div>

        <div className="p-10 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-4">Reserve Assets</p>
          <p className="text-4xl font-black italic tracking-tighter">
            {(balances.BTC || 0).toLocaleString('de-DE', { minimumFractionDigits: 4 })}
            <span className="text-xs text-gray-600 ml-3 uppercase">BTC</span>
          </p>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-white/[0.02] rounded-full group-hover:scale-150 transition-transform duration-700" />
        </div>
      </div>

      <main className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 lg:p-12 min-h-[500px] shadow-2xl">
        {renderTabContent()}
      </main>
    </div>
  );
}
