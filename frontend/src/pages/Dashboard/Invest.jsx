import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, ArrowRight, ShieldCheck, Loader2, AlertTriangle,
  PlusCircle, Zap, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

export default function Invest({ balances, refreshBalances }) {
  const { initialized, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Use balances passed from Dashboard (preferred) + local fallback
  const [localBalances, setLocalBalances] = useState({
    EUR: balances?.EUR || 0,
    ROI: balances?.ROI || 0,
  });

  /**
   * Fetch fresh portfolio data using the current flat stats endpoint
   */
  const fetchPortfolio = useCallback(async () => {
    if (!isAuthenticated) return;
    setFetching(true);

    try {
      const res = await api.get(API_ENDPOINTS.USER.STATS);

      if (res.data?.success) {
        const data = res.data;

        setLocalBalances({
          EUR: Number(data.principal || data.availableBalance || 0),   // Principal is the main invested amount
          ROI: Number(data.accruedROI || 0),
        });
      }
    } catch (err) {
      console.error("Ledger Sync Error:", err);
      toast.error('Failed to sync portfolio data');
    } finally {
      setFetching(false);
    }
  }, [isAuthenticated]);

  // Sync when balances are passed from parent or on mount
  useEffect(() => {
    if (balances) {
      setLocalBalances({
        EUR: Number(balances.EUR || 0),
        ROI: Number(balances.ROI || 0),
      });
    }
  }, [balances]);

  useEffect(() => {
    if (initialized) {
      if (!isAuthenticated) {
        navigate('/login');
      } else {
        fetchPortfolio();
      }
    }
  }, [initialized, isAuthenticated, fetchPortfolio, navigate]);

  /**
   * Handle Yield Compounding (ROI → Principal)
   */
  const handleCompound = async () => {
    if (localBalances.ROI < 10) {
      toast.error("Minimum €10.00 in accrued ROI required for reinvestment.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Processing compounding...");

    try {
      const res = await api.post(API_ENDPOINTS.USER.COMPOUND);

      if (res.data?.success) {
        toast.success("ROI successfully compounded into principal.", { id: toastId });

        // Optimistic update
        setLocalBalances(prev => ({
          EUR: prev.EUR + prev.ROI,
          ROI: 0,
        }));

        // Refresh parent dashboard
        if (refreshBalances) refreshBalances();

        // Optional: redirect back to main dashboard after success
        setTimeout(() => navigate('/dashboard'), 1800);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Compounding failed';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!initialized || fetching) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-[#020408]">
        <Loader2 className="text-emerald-500 animate-spin" size={56} />
        <p className="mt-6 text-xs font-black uppercase tracking-widest text-gray-500">
          Syncing Institutional Portfolio...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white">
      {/* Top Navigation */}
      <nav className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-[#020408]/95 backdrop-blur-xl sticky top-0 z-50">
        <div 
          className="flex items-center gap-4 cursor-pointer" 
          onClick={() => navigate('/dashboard')}
        >
          <LayoutDashboard className="text-emerald-500" size={24} />
          <h2 className="text-xl font-black tracking-tighter">Capital Hub</h2>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <ArrowRight className="rotate-180" size={20} />
        </button>
      </nav>

      <main className="p-6 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Zap className="text-emerald-500" size={16} />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Yield Compounding Protocol</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-none">
                Yield <span className="text-emerald-500">Maturity</span>
              </h1>
              <p className="text-gray-400 max-w-md">
                Compound your accrued ROI into institutional principal to increase future yield generation.
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard/deposit')}
              className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-black rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95"
            >
              <PlusCircle size={20} />
              Inject New Capital
            </button>
          </header>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ROI Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0c10] border border-white/10 rounded-3xl p-10 relative overflow-hidden group hover:border-emerald-500/40 transition-all"
            >
              <p className="uppercase text-xs tracking-widest text-emerald-500 font-semibold mb-4">Accrued ROI</p>
              <p className="text-6xl font-black tracking-tighter text-emerald-400">
                €{localBalances.ROI.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-10 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={16} /> Ready for compounding
              </div>
            </motion.div>

            {/* Principal Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0a0c10] border border-white/10 rounded-3xl p-10 relative overflow-hidden group hover:border-white/30 transition-all"
            >
              <p className="uppercase text-xs tracking-widest text-gray-400 font-semibold mb-4">Institutional Principal</p>
              <p className="text-6xl font-black tracking-tighter">
                €{localBalances.EUR.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-10 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={16} /> Current AUM baseline
              </div>
            </motion.div>
          </div>

          {/* Compound Action Section */}
          <section className="bg-[#0a0c10] border border-white/10 rounded-3xl p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-4xl font-black tracking-tighter">Execute Compounding</h3>
                <p className="text-gray-400 leading-relaxed">
                  Transfer accrued ROI into your principal. This action permanently increases your invested capital 
                  and will generate higher future daily yields.
                </p>

                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <p className="text-rose-400 text-sm font-medium">
                    ⚠️ This action is irreversible. Minimum €10.00 ROI required.
                  </p>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <button
                  onClick={handleCompound}
                  disabled={loading || localBalances.ROI < 10}
                  className={`px-16 py-8 rounded-3xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-4 ${
                    localBalances.ROI >= 10
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-xl shadow-emerald-600/40 active:scale-[0.97]'
                      : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={22} />
                  ) : (
                    <TrendingUp size={22} />
                  )}
                  {loading ? 'Processing...' : 'Confirm Compounding'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
