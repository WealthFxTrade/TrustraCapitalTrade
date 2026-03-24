// src/pages/Dashboard/Invest.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ArrowRight, ShieldCheck, Loader2, Wallet, TrendingUp,
  ChevronRight, PlusCircle, AlertCircle, RefreshCw, History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import InvestmentModal from '../components/invest/InvestmentModal';

export default function Invest() {
  const { user, refreshAuth } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [compoundDisabled, setCompoundDisabled] = useState(false);

  const balances = user?.balances || { EUR: 0, ROI: 0 };

  // Fetch profile & balances
  const fetchProfile = useCallback(async () => {
    setFetching(true);
    setError(null);

    try {
      const res = await api.get('/api/users/profile');
      if (res.data?.success) {
        refreshAuth(); // Update context with fresh user data
      }
    } catch (err) {
      console.error('Profile fetch failed:', err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status >= 500 ? 'Server temporarily unavailable' : 'Failed to sync profile');
      setError(msg);
      toast.error(msg, { duration: 6000 });
    } finally {
      setFetching(false);
    }
  }, [refreshAuth]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleCompound = async () => {
    if (compoundDisabled) return;

    const currentRoi = Number(balances.ROI) || 0;
    if (currentRoi < 10) {
      return toast.error("Minimum €10.00 required to compound.", { icon: '⚠️' });
    }

    setLoading(true);
    setCompoundDisabled(true);
    const loadId = toast.loading("Executing Re-Injection Protocol...");

    try {
      const res = await api.post('/api/users/compound-yield');

      if (res.data?.success) {
        toast.success("Yield successfully reinvested into capital.", { id: loadId });
        await refreshAuth(); // Refresh balances in context
        setTimeout(() => navigate('/dashboard'), 1800);
      } else {
        throw new Error(res.data?.message || 'Compound failed');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 400 ? 'Insufficient yield or invalid request' : 'Compound operation failed');
      toast.error(msg, { id: loadId });
    } finally {
      setLoading(false);
      setTimeout(() => setCompoundDisabled(false), 2000); // Debounce protection
    }
  };

  const getErrorMessage = (err) => {
    if (err.response?.data?.message) return err.response.data.message;
    const status = err.response?.status;
    if (status === 401 || status === 403) return 'Session expired. Please log in again.';
    if (!err.response && err.request) return 'Network error – please check your connection.';
    if (status >= 500) return 'Server temporarily unavailable – try again later.';
    return err.message || 'Operation failed. Please try again.';
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-8">
        <Loader2 className="text-yellow-500 animate-spin" size={56} />
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-yellow-500/50 mb-2">
            Syncing Capital Ledger
          </p>
          <p className="text-gray-500 text-sm">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-8 text-center px-6">
        <AlertCircle size={72} className="text-rose-500" />
        <h2 className="text-3xl font-black text-white">Ledger Access Failed</h2>
        <p className="text-gray-400 max-w-lg text-lg">{error}</p>
        <button
          onClick={fetchProfile}
          className="flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-sm hover:bg-yellow-500 transition-all shadow-lg"
        >
          <RefreshCw size={20} /> Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 lg:pt-32 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <TrendingUp className="text-yellow-500" size={22} />
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-yellow-500/60">
                Capital Expansion Module
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter">
              Yield <span className="text-yellow-500">Re-Injection</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-2xl font-black uppercase text-sm hover:from-yellow-500 hover:to-yellow-400 transition-all shadow-lg shadow-yellow-900/30 group"
            >
              <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
              Activate New Investment
            </button>
          </div>
        </header>

        {/* BALANCE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-10 rounded-[3rem] bg-gradient-to-br from-[#0a0c10] to-black border border-white/5 relative overflow-hidden shadow-2xl"
          >
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-3">
              Realized Yield (ROI)
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl lg:text-6xl font-black text-yellow-500 italic">
                €{Number(balances.ROI || 0).toFixed(2)}
              </span>
            </div>
            <Zap className="absolute -right-10 -bottom-10 opacity-[0.03] text-yellow-500" size={180} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-10 rounded-[3rem] bg-gradient-to-br from-[#0a0c10] to-black border border-white/5 relative overflow-hidden shadow-2xl"
          >
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-3">
              Active Principal (EUR)
            </span>
            <span className="text-5xl lg:text-6xl font-black text-white italic">
              €{Number(balances.EUR || 0).toFixed(2)}
            </span>
            <Wallet className="absolute -right-10 -bottom-10 opacity-[0.03]" size={180} />
          </motion.div>
        </div>

        {/* COMPOUND SECTION */}
        <section className="bg-[#0a0c10] border border-white/8 rounded-[3.5rem] p-10 lg:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <ShieldCheck size={28} className="text-emerald-500" />
                <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight">
                  Yield Re-Injection Protocol
                </h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Current Yield Available</p>
                <p className="text-2xl font-black text-yellow-500">
                  €{Number(balances.ROI || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-3xl">
              Re-invest your accrued yield of{' '}
              <span className="text-yellow-400 font-bold">
                €{Number(balances.ROI || 0).toFixed(2)}
              </span>{' '}
              back into your principal to increase future daily returns. This action is irreversible.
            </p>

            <div className="bg-black/40 border border-rose-500/20 rounded-2xl p-6 mb-10">
              <div className="flex items-start gap-4 text-rose-400 text-sm">
                <AlertCircle size={20} className="mt-1 flex-shrink-0" />
                <p>
                  <strong>Security Notice:</strong> Only initiate this protocol from a trusted device. Never share your credentials or recovery keys.
                </p>
              </div>
            </div>

            <button
              onClick={handleCompound}
              disabled={loading || compoundDisabled || balances.ROI < 10}
              className={`w-full py-8 font-black uppercase italic text-xl rounded-3xl flex items-center justify-center gap-6 transition-all duration-500 shadow-2xl ${
                loading || compoundDisabled || balances.ROI < 10
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black'
              }`}
              aria-label="Execute yield re-injection protocol"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>Processing Re-Injection...</span>
                </>
              ) : (
                <>
                  <span>Execute Protocol Alpha</span>
                  <ArrowRight className="group-hover:translate-x-3 transition-transform" size={28} />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Extra Actions */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-gray-300 hover:text-white transition-all"
          >
            <ChevronRight size={18} className="rotate-180" /> Return to Dashboard
          </button>

          <button
            onClick={() => navigate('/history')} // Adjust if you have a history route
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl hover:border-indigo-500/50 transition-all"
          >
            <History size={18} /> View Investment History
          </button>
        </div>
      </div>

      {/* New Investment Modal */}
      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userBalance={Number(balances.EUR || 0)}
        onSuccess={() => {
          fetchProfile();
          toast.success("New investment activated successfully");
        }}
      />
    </div>
  );
}
