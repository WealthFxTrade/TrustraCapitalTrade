// src/pages/Dashboard/Invest.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, ArrowRight, ShieldCheck, Loader2, AlertTriangle,
  PlusCircle, Zap, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

export default function Invest() {
  const { user, initialized, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [localBalances, setLocalBalances] = useState({ EUR: 0, ROI: 0 });

  /**
   * Fetch Fresh Portfolio Data from Node Ledger
   */
  const fetchPortfolio = useCallback(async () => {
    if (!isAuthenticated) return;
    setFetching(true);
    try {
      const res = await api.get(API_ENDPOINTS.USER.BALANCES);
      if (res.data?.success) {
        setLocalBalances({
          EUR: Number(res.data.balances.EUR || 0),
          ROI: Number(res.data.balances.ROI || 0)
        });
      }
    } catch (err) {
      toast.error('Sync Error: Connection to Ledger interrupted');
    } finally {
      setFetching(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (initialized) {
      if (!isAuthenticated) navigate('/login');
      else fetchPortfolio();
    }
  }, [initialized, isAuthenticated, fetchPortfolio, navigate]);

  /**
   * Handle Yield Reinvestment (Compounding)
   */
  const handleCompound = async () => {
    if (localBalances.ROI < 10) {
      toast.error("Minimum €10.00 in accrued ROI required for reinvestment.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Rebalancing Node Portfolio...");

    try {
      // PROD ROUTE: Matches router.post('/compound', compoundYield) in userRoutes.js
      const res = await api.post(API_ENDPOINTS.USER.COMPOUND);

      if (res.data?.success) {
        toast.success("Yield successfully compounded into principal.", { id: toastId });
        // Update local state to show zero ROI and boosted EUR
        setLocalBalances(prev => ({
          EUR: prev.EUR + prev.ROI,
          ROI: 0
        }));
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Compounding Protocol Failed';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!initialized || fetching) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center">
        <Loader2 className="text-emerald-500 animate-spin" size={56} />
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">
          Syncing Yield Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white flex flex-col font-sans">
      
      {/* ── TOP NAV ── */}
      <nav className="h-24 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-[#020408]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <LayoutDashboard className="text-emerald-500" size={24} />
          <h2 className="text-xl font-black tracking-tighter uppercase italic">Capital Hub</h2>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
        >
          <ArrowRight className="rotate-180" size={20} />
        </button>
      </nav>

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Hero Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Zap className="text-emerald-500" size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Strategic Compounding Protocol</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none">Yield <br/><span className="text-emerald-500">Maturity</span></h1>
              <p className="text-gray-500 text-sm font-medium max-w-lg leading-relaxed uppercase tracking-wider">
                Merge accrued ROI into your institutional principal to maximize future node performance.
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard/deposit')}
              className="flex items-center gap-4 px-10 py-5 bg-emerald-600 hover:bg-emerald-400 text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
            >
              <PlusCircle size={18} /> Inject New Capital
            </button>
          </header>

          {/* Balance Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group hover:border-emerald-500/30 transition-all"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 italic">Accrued Yield (ROI)</p>
              <p className="text-5xl lg:text-6xl font-black text-emerald-500 tracking-tighter italic">
                €{localBalances.ROI.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                <ShieldCheck size={12} /> Vaulted Liquidity
              </div>
              <TrendingUp className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-10 transition-opacity" size={180} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 italic">Institutional Principal</p>
              <p className="text-5xl lg:text-6xl font-black text-white tracking-tighter italic">
                €{localBalances.EUR.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                <ShieldCheck size={12} /> AUM Baseline
              </div>
            </motion.div>
          </div>

          {/* Action Hub */}
          <section className="bg-[#0a0c10] border border-white/5 rounded-[3.5rem] p-12 lg:p-16 relative overflow-hidden">
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic">Execute Settlement</h3>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest leading-relaxed">
                  Compounding shifts your realized ROI into your primary investment node. This increases your 
                  working capital and compounds future daily returns based on the updated AUM.
                </p>
                <div className="flex items-start gap-4 p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
                  <AlertTriangle className="text-rose-500 shrink-0 mt-1" size={18} />
                  <p className="text-[10px] text-rose-500/70 font-black uppercase tracking-widest leading-loose italic">
                    Finalization Notice: Compounding actions are immediate and cannot be reversed. Minimum required: €10.00.
                  </p>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <button
                  disabled={loading || localBalances.ROI < 10}
                  onClick={handleCompound}
                  className={`group relative px-16 py-8 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all overflow-hidden ${
                    localBalances.ROI >= 10 
                      ? 'bg-emerald-600 text-black hover:bg-emerald-500 shadow-2xl shadow-emerald-600/30 active:scale-95' 
                      : 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-4">
                    {loading ? <Loader2 className="animate-spin" /> : <TrendingUp size={20} />}
                    {loading ? 'Processing...' : 'Confirm Reinvestment'}
                    <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
            
            {/* Background Branding */}
            <div className="absolute top-0 right-0 p-12 opacity-5">
               <ShieldCheck size={200} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

