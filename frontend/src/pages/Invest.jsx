import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, ShieldCheck, Loader2, Wallet, TrendingUp, ChevronRight, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import InvestmentModal from '../components/invest/InvestmentModal';

export default function Invest() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── SYNC PROFILE DATA ──
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

  useEffect(() => {
    fetchProfile();
  }, []);

  // ── EXECUTE COMPOUNDING PROTOCOL ──
  const handleCompound = async () => {
    const currentRoi = user?.balances?.ROI || 0;
    if (currentRoi < 10) return toast.error("Minimum €10.00 required.");
    
    setLoading(true);
    const loadId = toast.loading("Executing Re-Injection...");

    try {
      const res = await api.post('/user/compound-yield');
      setUser({ ...user, balances: res.data.balances });
      toast.success("Yield injected into Capital.", { id: loadId });
      setTimeout(() => navigate('/dashboard'), 1500);
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
        
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-yellow-500" size={18} />
              <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/60">Asset Management</h1>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">Capital Expansion</h2>
          </div>

          {/* NEW NODE BUTTON */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all group"
          >
            <PlusCircle size={18} className="text-yellow-500 group-hover:text-black" />
            <span className="text-[10px] font-black uppercase tracking-widest">Activate New Node</span>
          </button>
        </header>

        {/* BALANCE NODES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
            <span className="text-[10px] font-black uppercase opacity-40 block mb-4 tracking-widest">Realized Yield (ROI)</span>
            <span className="text-5xl font-black text-yellow-500 italic">€{Number(balances.ROI).toFixed(2)}</span>
            <Zap className="absolute -right-4 -bottom-4 opacity-[0.02]" size={140} />
          </div>
          <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
            <span className="text-[10px] font-black uppercase opacity-40 block mb-4 tracking-widest">Active Principal (EUR)</span>
            <span className="text-5xl font-black text-white italic">€{Number(balances.EUR).toFixed(2)}</span>
            <Wallet className="absolute -right-4 -bottom-4 opacity-[0.02]" size={140} />
          </div>
        </div>

        {/* COMPOUNDING CORE */}
        <section className="bg-[#0a0c10] border border-white/10 p-12 rounded-[4rem] relative overflow-hidden shadow-2xl">
          <div className="relative z-10 text-center md:text-left">
            <div className="flex items-center gap-4 text-emerald-500 mb-8 justify-center md:justify-start">
              <ShieldCheck size={24} />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Yield Re-Injection Protocol</span>
            </div>
            
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl font-medium mb-12">
              Authorize the system to move <span className="text-yellow-500 font-bold">€{Number(balances.ROI).toFixed(2)}</span> from realized profits back into your master capital node. This increases your daily yield footprint.
            </p>

            <button
              onClick={handleCompound}
              disabled={loading || (balances.ROI < 10)}
              className="w-full group py-8 bg-yellow-500 hover:bg-white text-black font-black uppercase italic rounded-3xl flex items-center justify-center gap-6 transition-all duration-500 disabled:opacity-20 disabled:grayscale"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <span className="text-xl italic">Execute Protocol Alpha</span>
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* MODAL INTEGRATION */}
        <InvestmentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          userBalance={balances.EUR}
          onUpdate={fetchProfile}
        />

        <div className="mt-12 flex justify-center">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
            Cancel and Return <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
