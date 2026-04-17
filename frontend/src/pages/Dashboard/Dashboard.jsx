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

  // Core financial states - directly mapped from backend
  const [principal, setPrincipal] = useState(0);           // Total Principal (INVESTED)
  const [availableBalance, setAvailableBalance] = useState(0); // Liquid EUR
  const [accruedROI, setAccruedROI] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);

  const [transactions, setTransactions] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalAUM: 0,
    health: 'Operational'
  });
  const [pendingKYCs, setPendingKYCs] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch and sync user stats from the flattened backend response
   */
  const syncNodeData = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    setLoading(true);

    try {
      const res = await api.get(API_ENDPOINTS.USER.STATS);

      if (res.data?.success) {
        const data = res.data;

        // Direct mapping from backend flat fields
        setPrincipal(Number(data.principal || 0));
        setAvailableBalance(Number(data.availableBalance || 0));
        setAccruedROI(Number(data.accruedROI || 0));
        setBtcBalance(Number(data.btcBalance || 0));

        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }

        console.log('✅ Dashboard synced:', {
          principal: data.principal,
          availableBalance: data.availableBalance,
          accruedROI: data.accruedROI,
          btcBalance: data.btcBalance
        });
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err.response?.data || err.message);
      if (document.visibilityState === 'visible') {
        toast.error('Failed to sync vault data. Please check your connection.');
      }
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, []);

  /**
   * Fetch admin-only data
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
      console.error("Admin data fetch failed:", err);
    }
  }, [user?.role]);

  // Initial load + periodic sync
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

  const currentBalances = {
    EUR: availableBalance,
    ROI: accruedROI,
    BTC: btcBalance,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Invest':
        return <Invest balances={currentBalances} refreshBalances={syncNodeData} />;
      case 'Ledger':
        return <Ledger transactions={transactions} refreshBalances={syncNodeData} />;
      case 'Deposit':
        return <Deposit refreshBalances={syncNodeData} />;
      case 'Withdraw':
        return <Withdrawal balances={currentBalances} refreshBalances={syncNodeData} />;
      case 'Profile':
        return <Profile refreshSession={refreshSession} />;
      case 'AdminStats':
        return user?.role === 'admin' ? renderAdminView() : null;
      default:
        return null;
    }
  };

  const renderAdminView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
        <h3 className="font-black uppercase text-xs text-emerald-500 mb-6 tracking-widest">Global Vault Metrics</h3>
        <div className="space-y-6">
          <div className="flex justify-between items-center py-4 border-b border-white/10">
            <span className="text-gray-400">Total Users</span>
            <span className="text-2xl font-semibold">{adminStats.totalUsers || 0}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-white/10">
            <span className="text-gray-400">Total AUM</span>
            <span className="text-2xl font-semibold text-emerald-400">
              €{adminStats.totalAUM?.toLocaleString('de-DE') || '0'}
            </span>
          </div>
          <div className="flex justify-between items-center py-4">
            <span className="text-gray-400">System Health</span>
            <span className="text-2xl font-semibold text-blue-400">{adminStats.health}</span>
          </div>
        </div>
      </div>

      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
        <h3 className="font-black uppercase text-xs text-amber-500 mb-6 tracking-widest">KYC Review Queue</h3>
        {pendingKYCs.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 italic">
            All KYC submissions have been processed
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {pendingKYCs.map((kyc) => (
              <div key={kyc._id} className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10">
                <div>
                  <p className="font-medium">{kyc.name}</p>
                  <p className="text-sm text-gray-500">{kyc.email}</p>
                </div>
                <span className="px-5 py-2 text-xs font-bold bg-amber-500/10 text-amber-500 rounded-full">PENDING</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white">
      {/* Header */}
      <div className="px-6 pt-10 pb-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
              <h1 className="text-5xl font-black tracking-tight">Vault Dashboard</h1>
            </div>
            <p className="mt-2 text-gray-500">
              Institutional Node • {user?.name || 'Client'}
            </p>
          </div>

          <button
            onClick={syncNodeData}
            disabled={loading}
            className="flex items-center gap-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-bold text-sm uppercase tracking-[0.5px] rounded-2xl transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            {loading ? 'Syncing...' : 'Sync Vault Node'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 lg:px-12 mb-10">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {['Invest', 'Ledger', 'Deposit', 'Withdraw', 'Profile']
            .concat(user?.role === 'admin' ? ['AdminStats'] : [])
            .map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-emerald-500 text-black shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 lg:px-12 mb-12">
        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-9 hover:border-emerald-500/30 transition-colors">
          <p className="text-xs font-semibold tracking-widest text-gray-500 mb-3">TOTAL PRINCIPAL</p>
          <p className="text-5xl font-black tracking-tighter">€{principal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-9 hover:border-emerald-500/30 transition-colors">
          <p className="text-xs font-semibold tracking-widest text-emerald-500 mb-3">ACCRUED ROI</p>
          <p className="text-5xl font-black tracking-tighter text-emerald-400">€{accruedROI.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-9 hover:border-emerald-500/30 transition-colors">
          <p className="text-xs font-semibold tracking-widest text-gray-500 mb-3">RESERVE ASSETS</p>
          <p className="text-5xl font-black tracking-tighter">
            {btcBalance.toLocaleString('de-DE', { minimumFractionDigits: 4 })}
            <span className="text-lg font-normal text-gray-500 ml-3">BTC</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 lg:px-12">
        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-8 lg:p-12 min-h-[560px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
