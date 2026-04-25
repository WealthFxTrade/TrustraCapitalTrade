// src/pages/Dashboard/Dashboard.jsx
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

  // Core financial states
  const [principal, setPrincipal] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [accruedROI, setAccruedROI] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user stats
  const syncNodeData = useCallback(async (showLoading = true) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const res = await api.get(API_ENDPOINTS.USER.STATS);

      if (res.data?.success) {
        const data = res.data;
        setPrincipal(Number(data.principal || 0));
        setAvailableBalance(Number(data.availableBalance || 0));
        setAccruedROI(Number(data.accruedROI || 0));
        setBtcBalance(Number(data.btcBalance || 0));
        setEthBalance(Number(data.ethBalance || 0));

        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
      } else {
        throw new Error(res.data?.message || 'Failed to load data');
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      setError(err.response?.data?.message || err.message || 'Vault synchronization failed');
      if (document.visibilityState === 'visible') {
        toast.error('Failed to load vault data. Please retry.');
      }
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, []);

  // Real-time socket updates
  useEffect(() => {
    if (!user?._id && !user?.id) return;

    const userId = user._id || user.id;
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', userId);
      console.log('🔌 Connected to Vault Live-Stream');
    });

    socketRef.current.on('balanceUpdate', (data) => {
      if (data.balances) {
        setAvailableBalance(Number(data.balances.EUR || 0));
        setBtcBalance(Number(data.balances.BTC || 0));
        setEthBalance(Number(data.balances.ETH || 0));
        setAccruedROI(Number(data.balances.TOTAL_PROFIT || 0));
        setPrincipal(Number(data.balances.INVESTED || 0));
      }
      if (data.message) {
        toast.success(data.message, { icon: '💰' });
      }
      syncNodeData(false);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user, syncNodeData]);

  // Initial load + background sync
  useEffect(() => {
    if (user) {
      syncNodeData(true);
      const interval = setInterval(() => syncNodeData(false), 60000);
      return () => clearInterval(interval);
    }
  }, [user, syncNodeData]);

  const currentBalances = {
    EUR: availableBalance,
    ROI: accruedROI,
    BTC: btcBalance,
    ETH: ethBalance,
    INVESTED: principal,
  };

  const renderTabContent = () => {
    if (loading && transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-gray-500">Synchronizing with Blockchain...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'Invest': return <Invest balances={currentBalances} refreshBalances={syncNodeData} />;
      case 'Deposit': return <Deposit refreshBalances={syncNodeData} />;
      case 'Withdraw': return <Withdrawal balances={currentBalances} refreshBalances={syncNodeData} />;
      case 'Ledger': return <Ledger transactions={transactions} refreshBalances={syncNodeData} />;
      case 'Profile': return <Profile refreshSession={refreshSession} />;
      default: return null;
    }
  };

  // Global error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-red-400 text-6xl mb-6">⚠️</p>
          <h2 className="text-2xl font-bold mb-4">Failed to load dashboard</h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <button 
            onClick={() => syncNodeData(true)}
            className="px-8 py-4 bg-white text-black font-bold rounded-2xl flex items-center gap-3 mx-auto hover:bg-gray-200"
          >
            <RefreshCw className="w-5 h-5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Available EUR</p>
            <p className="text-3xl font-black">€{availableBalance.toLocaleString('de-DE')}</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Profit</p>
            <p className="text-3xl font-black text-emerald-400">€{accruedROI.toLocaleString('de-DE')}</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Principal</p>
            <p className="text-3xl font-black">€{principal.toLocaleString('de-DE')}</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Bitcoin</p>
            <p className="text-3xl font-black">{btcBalance.toFixed(8)} BTC</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar">
          {[
            { id: 'Invest', icon: LayoutDashboard },
            { id: 'Deposit', icon: Wallet },
            { id: 'Withdraw', icon: ArrowUpCircle },
            { id: 'Ledger', icon: History },
            { id: 'Profile', icon: UserIcon },
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

        {/* Main Content */}
        <div className="min-h-[500px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
