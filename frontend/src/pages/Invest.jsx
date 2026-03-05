import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, ShieldCheck, Loader2, Wallet, TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Invest() {
  const { user, setUser } = useAuth(); // 🛰️ Link to Global Protocol State
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 1. 📊 SYNC LOCAL LEDGER WITH GLOBAL CONTEXT
  useEffect(() => {
    if (user) {
      setFetching(false);
    } else {
      // Fallback if context is slow
      const fetchProfile = async () => {
        try {
          const res = await api.get('/user/profile');
          setUser(res.data.user);
        } catch (err) {
          toast.error("Protocol Sync Failed.");
        } finally {
          setFetching(false);
        }
      };
      fetchProfile();
    }
  }, [user, setUser]);

  // 2. ⚡ EXECUTE COMPOUNDING PROTOCOL
  const handleCompound = async () => {
    const currentRoi = user?.balances?.ROI || 0;
    
    if (currentRoi < 10) {
      return toast.error("Minimum €10.00 required for re-injection.", {
        style: { background: '#0a0c10', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }
      });
    }

    setLoading(true);
    const loadId = toast.loading("Initiating Capital Re-Injection...");

    try {
      const res = await api.post('/user/compound-yield');
      
      // ✅ ATOMIC SYNC: Update the global AuthContext immediately
      // This triggers the Dashboard & Header to update without a refresh
      setUser({ balances: res.data.balances });

      toast.success("Yield successfully injected into Capital.", { 
        id: loadId,
        duration: 5000 
      });

      // Optional: Redirect to dashboard to see the new numbers
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (err) {
      toast.error(err.response?.data?.message || "Execution Interrupted", { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-6">
      <Loader2 className="text-yellow-500 animate-spin" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.8em] text-yellow-500/40">Syncing Ledger...</span>
    </div>
  );

  const balances = user?.balances || { EUR: 0, ROI: 0 };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-32 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* ── HEADER ── */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-yellow-500" size={18} />
            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/60">
              Yield Management Protocol
            </h1>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
            Capital Re-Injection
          </h2>
        </header>

        {/* ── BALANCE NODES ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group"
          >
            <span className="text-[10px] font-black uppercase opacity-40 block mb-4 tracking-widest">Realized Yield</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-yellow-500 italic">€{Number(balances.ROI).toFixed(2)}</span>
            </div>
            <Zap className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-all" size={140} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group"
          >
            <span className="text-[10px] font-black uppercase opacity-40 block mb-4 tracking-widest">Active Principal</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white italic">€{Number(balances.EUR).toFixed(2)}</span>
            </div>
            <Wallet className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-all" size={140} />
          </motion.div>
        </div>

        {/* ── EXECUTION CORE ── */}
        <section className="bg-[#0a0c10] border border-white/10 p-12 rounded-[4rem] relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-4 text-emerald-500 mb-8">
              <ShieldCheck size={24} />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Institutional Grade Compounding Active</span>
            </div>
            
            <div className="space-y-6 mb-12">
              <p className="text-gray-400 text-lg leading-relaxed max-w-2xl font-medium">
                By executing this protocol, you are authorizing the system to move <span className="text-yellow-500 font-bold">€{Number(balances.ROI).toFixed(2)}</span> from your realized profits back into your master capital node.
              </p>
              <ul className="space-y-3">
                {[
                  "No processing fees for internal re-injection",
                  "Immediate effect on daily ROI calculations",
                  "Verified through Zurich HQ Clearing House"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <div className="h-1 w-1 bg-yellow-500 rounded-full" /> {text}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={handleCompound}
              disabled={loading || (balances.ROI < 10)}
              className="w-full group py-8 bg-yellow-500 hover:bg-white text-black font-black uppercase italic rounded-3xl flex items-center justify-center gap-6 transition-all duration-500 disabled:opacity-20 disabled:grayscale"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span className="text-xl">Execute Protocol Alpha</span>
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
            
            {balances.ROI < 10 && !loading && (
              <p className="text-center mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-red-500/60 animate-pulse">
                Node liquidity must exceed €10.00 to initiate compounder
              </p>
            )}
          </div>

          {/* BACKGROUND DECOR */}
          <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
             <div className="absolute top-10 right-10 border-[40px] border-white rounded-full w-96 h-96 blur-3xl" />
          </div>
        </section>

        {/* FOOTER NAV */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            Cancel and Return to Terminal <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
