import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  History, ArrowUpRight, LogOut, ShieldCheck, Loader2, 
  CheckCircle, XCircle, Clock, Globe, RefreshCw 
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function WithdrawalHistory() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, initialized } = useAuth();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { path: '/dashboard', label: 'Terminal Home', icon: History },
    { path: '/dashboard/deposit', label: 'Fund Vault', icon: ArrowUpRight },
    { path: '/dashboard/withdrawal', label: 'Withdraw', icon: ArrowUpRight },
    { path: '/dashboard/withdrawal-history', label: 'Withdrawal History', icon: History, active: true },
  ];

  // Fetch withdrawal history
  const fetchWithdrawalHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/withdrawals');

      if (res.data?.success) {
        setWithdrawals(res.data.withdrawals || []);
      } else {
        toast.error('Failed to load withdrawal history');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to load withdrawal history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      fetchWithdrawalHistory();
    }
  }, [initialized, isAuthenticated, fetchWithdrawalHistory]);

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', label: 'Pending' },
      processing: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', label: 'Processing' },
      completed: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', label: 'Completed' },
      rejected: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/30', label: 'Rejected' },
      cancelled: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/30', label: 'Cancelled' },
    };

    const { color, label } = config[status] || config.pending;

    return (
      <span className={`px-5 py-1.5 rounded-full text-xs font-medium border ${color}`}>
        {label}
      </span>
    );
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Loading Withdrawal History...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-80 bg-[#0a0c10] border-r border-white/5 p-8 h-screen sticky top-0 shadow-2xl z-50">
        <div className="flex items-center gap-3 mb-16 px-2">
          <ShieldCheck className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none italic">TRUSTRA</h1>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">CAPITAL</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all w-full text-left group border ${
                item.active
                  ? 'bg-emerald-600 border-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-emerald-400'
              }`}
            >
              <item.icon size={18} className={item.active ? 'text-black' : 'group-hover:text-emerald-400'} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5">
          <button 
            onClick={logout} 
            className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:text-rose-500 transition-all group w-full font-black text-[10px] uppercase tracking-widest"
          >
            <LogOut size={18} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className="h-24 border-b border-white/5 bg-[#020408]/80 backdrop-blur-xl flex items-center justify-between px-8 lg:px-14 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Withdrawal <span className="text-emerald-500">History</span></h2>
          </div>
          <button 
            onClick={fetchWithdrawalHistory}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm transition-all"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        <main className="p-6 lg:p-14 max-w-6xl mx-auto w-full">
          <div className="bg-[#0a0c10] border border-white/5 rounded-[3.5rem] p-10 lg:p-14 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black">All Withdrawal Requests</h3>
              <span className="text-xs text-gray-500 font-mono">
                {withdrawals.length} records
              </span>
            </div>

            {withdrawals.length > 0 ? (
              <div className="space-y-4">
                {withdrawals.map((wd) => (
                  <motion.div
                    key={wd._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${wd.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        <ArrowUpRight size={28} />
                      </div>
                      <div>
                        <p className="font-medium text-lg">
                          €{parseFloat(wd.amount).toFixed(2)} {wd.asset}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {new Date(wd.createdAt).toLocaleDateString('de-DE', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })} • {wd.walletType} Vault
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3">
                      {getStatusBadge(wd.status)}
                      {wd.address && (
                        <p className="text-xs font-mono text-gray-500 max-w-[260px] truncate">
                          {wd.address}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center opacity-40">
                <History size={64} className="mx-auto mb-6" />
                <p className="text-lg font-medium">No withdrawals yet</p>
                <p className="text-sm text-gray-500 mt-2">Your withdrawal requests will appear here</p>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center text-xs text-gray-500 max-w-md mx-auto">
            All withdrawals undergo manual security review. Completed transactions are irreversible.
          </div>
        </main>
      </div>
    </div>
  );
}

// Status Badge Helper
function getStatusBadge(status) {
  const config = {
    pending: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', label: 'Pending' },
    processing: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', label: 'Processing' },
    completed: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', label: 'Completed' },
    rejected: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/30', label: 'Rejected' },
    cancelled: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/30', label: 'Cancelled' },
  };

  const { color, label } = config[status] || config.pending;

  return (
    <span className={`px-5 py-1.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}
