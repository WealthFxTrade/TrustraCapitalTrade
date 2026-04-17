// frontend/src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import Deposit from './Deposit.jsx';
import Withdrawal from './Withdrawal.jsx';
import Invest from './Invest.jsx';
import Ledger from './Ledger.jsx';
import Profile from './Profile.jsx';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Loader2, RefreshCw, LayoutDashboard, Wallet, ArrowUpCircle, History, User as UserIcon, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const { user, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState('Invest');
  const isSyncing = useRef(false);
  const socketRef = useRef(null);

  // Core financial states - strictly synced with Backend User.js Map
  const [principal, setPrincipal] = useState(0);           // from INVESTED
  const [availableBalance, setAvailableBalance] = useState(0); // from EUR
  const [accruedROI, setAccruedROI] = useState(0);         // from TOTAL_PROFIT
  const [btcBalance, setBtcBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);

  const [transactions, setTransactions] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalAUM: 0,
    health: 'Operational'
  });
  const [pendingKYCs, setPendingKYCs] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch and sync user stats from the backend
   */
  const syncNodeData = useCallback(async (showLoading = true) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    if (showLoading) setLoading(true);

    try {
      const res = await api.get(API_ENDPOINTS.USER.STATS);

      if (res.data?.success) {
        const data = res.data;
        // Map backend fields to frontend states
        setPrincipal(Number(data.principal || 0));
        setAvailableBalance(Number(data.availableBalance || 0));
        setAccruedROI(Number(data.accruedROI || 0));
        setBtcBalance(Number(data.btcBalance || 0));
        setEthBalance(Number(data.ethBalance || 0));

        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err.response?.data || err.message);
      if (document.visibilityState === 'visible') {
        toast.error('Vault synchronization failed.');
      }
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, []);

  /**
   * REAL-TIME SOCKET INTEGRATION
   * Listens for 'balanceUpdate' from btcWatcher, ethWatcher, and rioEngine
   */
  useEffect(() => {
    if (user?._id || user?.id) {
      const userId = user._id || user.id;
      
      // Initialize Socket connection
      socketRef.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socketRef.current.on('connect', () => {
        socketRef.current.emit('join', userId);
        console.log('🔌 Connected to Vault Live-Stream');
      });

      socketRef.current.on('balanceUpdate', (data) => {
        // Instant update of local state
        if (data.balances) {
          setAvailableBalance(Number(data.balances.EUR || 0));
          setBtcBalance(Number(data.balances.BTC || 0));
          setEthBalance(Number(data.balances.ETH || 0));
          setAccruedROI(Number(data.balances.TOTAL_PROFIT || 0));
          setPrincipal(Number(data.balances.INVESTED || 0));
        }

        if (data.message) {
          toast.success(data.message, { 
            icon: '💰', 
            duration: 5000,
            style: { background: '#10b981', color: '#fff' }
          });
        }
        
        // Refresh transaction history quietly
        syncNodeData(false);
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [user, syncNodeData]);

  /**
   * Fetch admin data if applicable
   */
  const fetchAdminData = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const [statsRes, kycRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.HEALTH),
        api.get(`${API_ENDPOINTS.ADMIN.USERS}?kyc=pending`),
      ]);
      if (statsRes.data.success) setAdminStats(statsRes.data.data || statsRes.data.stats || {});
      if (kycRes.data.success) setPendingKYCs(kycRes.data.users || []);
    } catch (err) {
      console.error("Admin metrics fetch failed");
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      syncNodeData();
      if (user.role === 'admin') fetchAdminData();

      const interval = setInterval(() => {
        syncNodeData(false); // Background sync every 60s
        if (user.role === 'admin') fetchAdminData();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [user, syncNodeData, fetchAdminData]);

  const currentBalances = {
    EUR: availableBalance,
    ROI: accruedROI,
    BTC: btcBalance,
    ETH: ethBalance,
    INVESTED: principal
  };

  const renderTabContent = () => {
    if (loading && transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-gray-500 font-medium italic">Synchronizing with Blockchain...</p>
        </div>
      );
    }

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
        <h3 className="font-black uppercase text-xs text-emerald-500 mb-6 tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Global Vault Metrics
        </h3>
        <div className="space-y-6">
          <div className="flex justify-between items-center py-4 border-b border-white/5">
            <span className="text-gray-400">Total Network Users</span>
            <span className="text-2xl font-bold">{adminStats.totalUsers || 0}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-white/5">
            <span className="text-gray-400">Assets Under Management</span>
            <span className="text-2xl font-bold text-emerald-400">
              €{adminStats.totalAUM?.toLocaleString('de-DE') || '0'}
            </span>
          </div>
          <div className="flex justify-between items-center py-4">
            <span className="text-gray-400">Infrastructure Health</span>
            <span className="text-xl font-bold text-blue-400">{adminStats.health}</span>
          </div>
        </div>
      </div>

      <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
        <h3 className="font-black uppercase text-xs text-amber-500 mb-6 tracking-widest">KYC Review Queue</h3>
        {pendingKYCs.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500 italic">
            No pending verifications
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {pendingKYCs.map((kyc) => (
              <div key={kyc._id} className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10">
                <div>
                  <p className="font-bold text-white">{kyc.name}</p>
                  <p className="text-xs text-gray-500">{kyc.email}</p>
                </div>
                <span className="px-4 py-1.5 text-[10px] font-black bg-amber-500/20 text-amber-500 rounded-full border border-amber-500/20">PENDING</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* TOP METRICS BAR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Available EUR</p>
            <p className="text-2xl font-black text-white">€{availableBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Profit</p>
            <p className="text-2xl font-black text-emerald-400">€{accruedROI.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Principal</p>
            <p className="text-2xl font-black text-white">€{principal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Bitcoin</p>
            <p className="text-2xl font-black text-white">{btcBalance.toFixed(8)} BTC</p>
          </div>
        </div>

        {/* NAVIGATION TAB BAR */}
        <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar">
          {[
            { id: 'Invest', icon: LayoutDashboard },
            { id: 'Deposit', icon: Wallet },
            { id: 'Withdraw', icon: ArrowUpCircle },
            { id: 'Ledger', icon: History },
            { id: 'Profile', icon: UserIcon },
            ...(user?.role === 'admin' ? [{ id: 'AdminStats', icon: ShieldCheck }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-white text-black scale-105 shadow-xl shadow-white/10' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.id}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="min-h-[500px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

