// src/pages/Dashboard/Dashboard.jsx - FULLY CORRECTED & UNSHORTENED FINAL VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  History,
  Repeat,
  PlusCircle,
  LogOut,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Menu,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import toast from 'react-hot-toast';

function SidebarLink({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all w-full text-left group focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
        active
          ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-500/20'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} className={active ? 'text-black' : 'text-gray-500 group-hover:text-white'} />
      <span className="text-[10px] font-black tracking-[0.2em] uppercase italic">{label}</span>
    </button>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [balances, setBalances] = useState({
    totalBalance: 0,
    profitBalance: 0,
    availableBalance: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [balanceError, setBalanceError] = useState(null);
  const [txError, setTxError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch balances from backend
  const fetchBalances = async () => {
    setLoadingBalances(true);
    setBalanceError(null);
    try {
      const res = await api.get('/api/user/balances');
      if (res.data?.success && res.data?.data) {
        setBalances(res.data.data);
      }
    } catch (err) {
      console.error('[BALANCES ERROR]', err);
      setBalanceError('Unable to load balances');
      toast.error('Unable to load balances');
    } finally {
      setLoadingBalances(false);
    }
  };

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    setLoadingTx(true);
    setTxError(null);
    try {
      const res = await api.get('/api/user/transactions/recent');
      if (res.data?.success && res.data?.data) {
        setRecentTransactions(res.data.data);
      }
    } catch (err) {
      console.error('[RECENT TRANSACTIONS ERROR]', err);
      setTxError('Unable to load recent activity');
      toast.error('Unable to load recent activity');
    } finally {
      setLoadingTx(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchBalances();
    fetchRecentTransactions();
  }, []);

  const navItems = [
    { to: '/dashboard', label: 'Terminal', icon: LayoutDashboard, active: true },
    { to: '/dashboard/deposit', label: 'Inbound', icon: PlusCircle },
    { to: '/dashboard/withdrawal', label: 'Outbound', icon: Repeat },
    { to: '/dashboard/ledger', label: 'Ledger', icon: History },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#020408] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" 
              onClick={() => setMobileMenuOpen(false)} 
            />
            <motion.aside 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              className="fixed inset-y-0 left-0 w-80 bg-black/95 border-r border-white/5 z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500 p-2 rounded-xl text-black shadow-lg">
                      <Zap size={22} fill="currentColor" />
                    </div>
                    <span className="text-2xl font-black italic tracking-tighter uppercase">Trustra Node</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                    <X size={28} />
                  </button>
                </div>

                <nav className="flex-1 space-y-2">
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-6 px-4">INTERNAL SYSTEMS</p>
                  {navItems.map((item) => (
                    <SidebarLink
                      key={item.to}
                      icon={item.icon}
                      label={item.label}
                      active={item.active}
                      onClick={() => handleNavClick(item.to)}
                    />
                  ))}
                </nav>

                <button
                  onClick={logout}
                  className="mt-auto flex items-center gap-4 px-5 py-4 text-gray-500 hover:text-rose-500 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-black/50 backdrop-blur-xl p-8 hidden lg:flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-16 px-4">
          <div className="bg-yellow-500 p-2 rounded-xl text-black shadow-lg">
            <Zap size={22} fill="currentColor" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter uppercase">
            Trustra <span className="text-white/50 font-light">Node</span>
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-6 px-4">INTERNAL SYSTEMS</p>
          {navItems.map((item) => (
            <SidebarLink
              key={item.to}
              icon={item.icon}
              label={item.label}
              active={item.active}
              onClick={() => handleNavClick(item.to)}
            />
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-auto flex items-center gap-4 px-5 py-4 text-gray-500 hover:text-rose-500 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#020408]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="text-gray-300 hover:text-white">
              <Menu size={28} />
            </button>
            <span className="text-xl font-black italic tracking-tighter uppercase">Trustra</span>
          </div>

          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3 flex-1 justify-center lg:justify-start">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            SECURE NODE ONLINE
          </div>

          <div className="flex items-center gap-4 text-gray-600">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">AES-256 • MULTI-LAYER AUDIT</span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-12 max-w-[1600px] mx-auto w-full space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
              Welcome back, <span className="text-yellow-500">{user?.username || 'infocare_admin'}</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">
              Your capital terminal • AES-256 protected • Last activity: {new Date().toLocaleString()}
            </p>
          </motion.div>

          {/* Balances Section */}
          {loadingBalances ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
              <p className="text-yellow-500 font-black uppercase tracking-widest text-sm">Fetching real-time balances...</p>
            </div>
          ) : balanceError ? (
            <div className="bg-rose-900/20 border border-rose-700/40 rounded-2xl p-8 text-center">
              <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-rose-300 mb-2">Balance Load Failed</h3>
              <p className="text-rose-200 mb-6">{balanceError}</p>
              <button
                onClick={fetchBalances}
                className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase tracking-wider flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={18} /> Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Total Balance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0a0c10] border border-blue-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Wallet size={24} className="text-blue-400" />
                  <span className="text-sm font-black uppercase text-gray-500">Total Balance</span>
                </div>
                <h2 className="text-5xl font-black text-white">€{balances.totalBalance.toLocaleString('en-IE')}</h2>
              </motion.div>

              {/* Realized Profit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#0a0c10] border border-emerald-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp size={24} className="text-emerald-400" />
                  <span className="text-sm font-black uppercase text-gray-500">Realized Profit</span>
                </div>
                <h2 className="text-5xl font-black text-emerald-400">
                  +€{balances.profitBalance.toLocaleString('en-IE')}
                </h2>
              </motion.div>

              {/* Available to Withdraw */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#0a0c10] border border-yellow-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <ArrowDownLeft size={24} className="text-yellow-400" />
                  <span className="text-sm font-black uppercase text-gray-500">Available to Withdraw</span>
                </div>
                <h2 className="text-5xl font-black text-yellow-400">
                  €{balances.availableBalance.toLocaleString('en-IE')}
                </h2>
              </motion.div>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { to: '/dashboard/deposit', icon: PlusCircle, label: 'Deposit Funds', color: 'text-yellow-500' },
              { to: '/dashboard/withdrawal', icon: ArrowUpRight, label: 'Withdraw', color: 'text-rose-400' },
              { to: '/dashboard/ledger', icon: History, label: 'View Ledger', color: 'text-emerald-400' },
            ].map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center gap-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              >
                <item.icon size={32} className={item.color} />
                <span className="text-sm font-black uppercase">{item.label}</span>
              </button>
            ))}

            {/* ADMIN PANEL BUTTON - ONLY VISIBLE WHEN ROLE IS ADMIN */}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center gap-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              >
                <ShieldCheck size={32} className="text-yellow-500" />
                <span className="text-sm font-black uppercase">Admin Panel</span>
              </button>
            )}
          </div>

          {/* Recent Activity Section */}
          <div className="bg-[#0a0c10] border border-white/8 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History size={24} className="text-emerald-400" />
                <h3 className="text-xl font-black uppercase tracking-tight">Recent Activity</h3>
              </div>
              <button
                onClick={() => navigate('/dashboard/ledger')}
                className="text-sm font-black uppercase text-yellow-500 hover:text-yellow-400 flex items-center gap-2"
              >
                View Full Ledger <ArrowUpRight size={16} />
              </button>
            </div>

            {loadingTx ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-yellow-500 mb-4" />
                <p className="text-gray-500">Loading recent activity...</p>
              </div>
            ) : txError ? (
              <div className="p-12 text-center">
                <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
                <p className="text-rose-300 mb-4">{txError}</p>
                <button
                  onClick={fetchRecentTransactions}
                  className="px-6 py-3 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-700 rounded-xl text-rose-200 font-black uppercase text-sm"
                >
                  Retry
                </button>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <History size={48} className="mx-auto mb-4 opacity-50" />
                <p>No recent activity yet</p>
                <p className="text-sm mt-2">RIO Midnight distributions and deposits will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentTransactions.map((tx, index) => (
                  <div key={tx._id || index} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {tx.amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-white capitalize">{tx.description || tx.type}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock size={14} /> {new Date(tx.createdAt || tx.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount || 0).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security Footer */}
          <div className="bg-[#0a0c10] border border-white/8 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <ShieldCheck size={32} className="text-emerald-500" />
              <div>
                <h4 className="text-lg font-black uppercase text-white">Node Security</h4>
                <p className="text-sm text-gray-500">AES-256 • Multi-layer audit • Active</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last sync: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
