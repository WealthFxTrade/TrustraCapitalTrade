// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import api, { API_ENDPOINTS } from '@/api/api';
import { SOCKET_URL } from '@/constants/api';
import toast from 'react-hot-toast';

import Deposit from './Deposit';
import Withdrawal from './Withdrawal';
import Invest from './Invest';
import Ledger from './Ledger';
import Profile from './Profile';

import {
  Loader2,
  RefreshCw,
  LayoutDashboard,
  Wallet,
  ArrowUpCircle,
  History,
  User as UserIcon,
} from 'lucide-react';

export default function Dashboard() {
  const { user, refreshSession } = useAuth();

  const [activeTab, setActiveTab] = useState('Invest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Financial Data
  const [principal, setPrincipal] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [accruedROI, setAccruedROI] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const isSyncing = useRef(false);
  const socketRef = useRef(null);

  // Sync Dashboard Data
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
        throw new Error(res.data?.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to synchronize data';
      setError(errorMsg);
      if (document.visibilityState === 'visible') {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, []);

  // Real-time Socket Connection
  useEffect(() => {
    if (!user?._id && !user?.id) return;

    const userId = user._id || user.id;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || SOCKET_URL;

    socketRef.current = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Connected to Real-time Vault Stream');
      socketRef.current.emit('join', userId);
    });

    socketRef.current.on('balanceUpdate', (data) => {
      if (data.balances) {
        setAvailableBalance(Number(data.balances.EUR || 0));
        setBtcBalance(Number(data.balances.BTC || 0));
        setEthBalance(Number(data.balances.ETH || 0));
        setAccruedROI(Number(data.balances.TOTAL_PROFIT || 0));
        setPrincipal(Number(data.balances.INVESTED || 0));
      }
      if (data.message) toast.success(data.message, { icon: '💰' });

      syncNodeData(false); // Background refresh
    });

    socketRef.current.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, syncNodeData]);

  // Initial Load + Auto Refresh
  useEffect(() => {
    if (user) {
      syncNodeData(true);
      const interval = setInterval(() => syncNodeData(false), 45000); // 45 seconds
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
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
          <p className="text-gray-400">Synchronizing with Blockchain Nodes...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'Invest':    return <Invest balances={currentBalances} refreshBalances={syncNodeData} />;
      case 'Deposit':   return <Deposit refreshBalances={syncNodeData} />;
      case 'Withdraw':  return <Withdrawal balances={currentBalances} refreshBalances={syncNodeData} />;
      case 'Ledger':    return <Ledger transactions={transactions} refreshBalances={syncNodeData} />;
      case 'Profile':   return <Profile balances={currentBalances} refreshSession={refreshSession} />;
      default:          return <div className="p-12 text-center text-gray-500">Tab content not available</div>;
    }
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-6">⚠️</p>
          <h2 className="text-2xl font-bold mb-4 text-white">Dashboard Sync Failed</h2>
          <p className="text-red-400 mb-8">{error}</p>
          <button
            onClick={() => syncNodeData(true)}
            className="px-8 py-4 bg-white text-black font-bold rounded-2xl flex items-center gap-3 mx-auto hover:bg-gray-200 transition-all"
          >
            <RefreshCw className="w-5 h-5" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Balance Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Available</p>
            <p className="text-3xl font-black mt-2">€{availableBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-6">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Total Profit</p>
            <p className="text-3xl font-black text-emerald-400 mt-2">€{accruedROI.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Invested</p>
            <p className="text-3xl font-black mt-2">€{principal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-6">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Bitcoin</p>
            <p className="text-3xl font-black mt-2">{btcBalance.toFixed(8)} BTC</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-3 no-scrollbar border-b border-white/10">
          {[
            { id: 'Invest',    icon: LayoutDashboard, label: 'Invest' },
            { id: 'Deposit',   icon: Wallet,          label: 'Deposit' },
            { id: 'Withdraw',  icon: ArrowUpCircle,   label: 'Withdraw' },
            { id: 'Ledger',    icon: History,         label: 'Ledger' },
            { id: 'Profile',   icon: UserIcon,        label: 'Profile' },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-6 md:p-8 min-h-[60vh]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
