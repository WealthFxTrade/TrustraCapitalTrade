// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Deposit from './Deposit.jsx';
import Withdrawal from './Withdrawal.jsx';
import Invest from './Invest.jsx';
import Ledger from './Ledger.jsx';
import Profile from './Profile.jsx';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState('Invest');
  
  // Updated keys to match Backend Mongoose Map (EUR, ROI)
  const [balances, setBalances] = useState({ EUR: 0, ROI: 0, BTC: 0 });
  const [transactions, setTransactions] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [pendingKYCs, setPendingKYCs] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);

  // ------------------- Fetch User Balances -------------------
  const fetchBalances = async () => {
    setLoadingBalances(true);
    try {
      // API_ENDPOINTS.USER.STATS is now '/users/stats' (plural)
      const res = await api.get(API_ENDPOINTS.USER.STATS);
      
      if (res.data.success) {
        // FIX: Access .stats instead of .data.data
        // FIX: Provide a default object to prevent .toLocaleString() crashes
        const statsData = res.data.stats || {};
        setBalances(statsData.balances || { EUR: 0, ROI: 0, BTC: 0 });
        
        // Ledger data is handled by stats or a separate ledger call
        if (statsData.transactions) setTransactions(statsData.transactions);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      toast.error(err.response?.data?.message || 'Failed to sync with Vault node');
    } finally {
      setLoadingBalances(false);
    }
  };

  // ------------------- Fetch Admin Stats -------------------
  const fetchAdminData = async () => {
    if (user?.role !== 'admin') return;
    try {
      const [statsRes, kycRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.HEALTH),
        api.get(`${API_ENDPOINTS.ADMIN.USERS}?kyc=pending`),
      ]);
      // Note: Admin controllers usually return .data or .stats
      if (statsRes.data.success) setAdminStats(statsRes.data.data || statsRes.data.stats || {});
      if (kycRes.data.success) setPendingKYCs(kycRes.data.users || []);
    } catch (err) {
      toast.error('Institutional Admin Data offline');
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalances();
      fetchAdminData();
    }
  }, [user]);

  // ------------------- Tab Content -------------------
  const renderTab = () => {
    switch (activeTab) {
      case 'Invest':
        return <Invest balances={balances} refreshBalances={fetchBalances} />;
      case 'Ledger':
        return <Ledger transactions={transactions} refreshBalances={fetchBalances} />;
      case 'Deposit':
        return <Deposit refreshBalances={fetchBalances} />;
      case 'Withdraw':
        return <Withdrawal balances={balances} refreshBalances={fetchBalances} />;
      case 'Profile':
        return <Profile refreshSession={refreshSession} />;
      case 'AdminStats':
        return user?.role === 'admin' ? (
          <div className="grid gap-4">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="font-black uppercase text-[10px] text-emerald-500 mb-4 tracking-widest">Global Vault Metrics</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">Total Users: <span className="font-bold">{adminStats.totalUsers || 0}</span></p>
                <p className="flex justify-between">Total AUM: <span className="font-bold text-emerald-400">€{adminStats.totalAUM?.toLocaleString() || 0}</span></p>
                <p className="flex justify-between">Pending Withdrawals: <span className="font-bold text-amber-400">€{adminStats.pendingWithdrawals?.toLocaleString() || 0}</span></p>
                <p className="flex justify-between">Health Status: <span className="font-bold text-blue-400">{adminStats.health || 'Operational'}</span></p>
              </div>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="font-black uppercase text-[10px] text-amber-500 mb-4 tracking-widest">Pending KYC Requests</h3>
              {pendingKYCs.length === 0 ? (
                <p className="text-gray-500 text-sm">Clear queue.</p>
              ) : (
                <ul className="space-y-3">
                  {pendingKYCs.map((k) => (
                    <li key={k._id} className="text-xs bg-white/5 p-3 rounded-lg flex justify-between items-center">
                      <span>{k.name} ({k.email})</span>
                      <span className="text-amber-500 font-bold uppercase">{k.kycStatus}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : <p className="text-rose-500 font-bold">Access Denied</p>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-10">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Vault <span className="text-emerald-500">Dashboard</span></h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Identity: {user?.fullName || user?.name || 'Institutional Client'}</p>
        </div>
        <button
          onClick={fetchBalances}
          disabled={loadingBalances}
          className="px-6 py-2 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 font-black text-xs uppercase transition-all disabled:opacity-50"
        >
          {loadingBalances ? 'Syncing...' : 'Sync Node'}
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
        {['Invest', 'Ledger', 'Deposit', 'Withdraw', 'Profile']
          .concat(user?.role === 'admin' ? ['AdminStats'] : [])
          .map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
      </nav>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2rem]">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Available principal</p>
          <p className="text-3xl font-black italic">€{(balances.EUR || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2rem]">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Accrued Yield (ROI)</p>
          <p className="text-3xl font-black italic text-emerald-400">€{(balances.ROI || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2rem]">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Reserve Node</p>
          <p className="text-3xl font-black italic">{(balances.BTC || 0)} <span className="text-xs text-gray-600">BTC</span></p>
        </div>
      </div>

      {/* Viewport Render */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 min-h-[400px]">
        {renderTab()}
      </div>
    </div>
  );
}
