import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Repeat, ArrowDown, Zap, ShieldCheck, 
  RefreshCw, Info, AlertCircle, TrendingUp,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function Exchange() {
  const { user, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(64250.42); // Example BTC/EUR rate
  const [fromAsset, setFromAsset] = useState('PROFIT'); // Profit Wallet
  const [toAsset, setToAsset] = useState('BALANCE'); // Main Balance
  const [amount, setAmount] = useState('');
  
  // ── DYNAMIC CALCULATION ──
  const receiveAmount = amount ? (parseFloat(amount) * 0.985).toFixed(2) : '0.00'; // 1.5% Protocol Fee

  const handleExchange = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return toast.error("Invalid Allocation Amount");
    
    const balanceToCheck = fromAsset === 'PROFIT' ? user?.balances?.EUR_PROFIT : user?.balances?.EUR;
    if (parseFloat(amount) > balanceToCheck) {
      return toast.error("Insufficient Node Liquidity");
    }

    setLoading(true);
    const loadToast = toast.loading("Executing Atomic Swap...");

    try {
      await api.post('/user/exchange', {
        from: fromAsset,
        to: toAsset,
        amount: parseFloat(amount)
      });
      
      toast.success("Liquidity Rebalanced Successfully", { id: loadToast });
      setAmount('');
      refreshAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || "Exchange Protocol Failed", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  const swapDirections = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 pt-28 font-sans selection:bg-yellow-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* ── HEADER ── */}
        <header className="mb-12">
          <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/60 mb-4">
            Atomic Swap Protocol v4.0
          </h1>
          <p className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
            Internal <span className="text-yellow-500">Liquidity</span> Exchange
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          
          <form onSubmit={handleExchange} className="space-y-4">
            
            {/* FROM BOX */}
            <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] relative group hover:border-white/10 transition-all">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">From Ledger</span>
                <span className="text-[10px] font-black uppercase text-yellow-500/60">
                  Available: €{fromAsset === 'PROFIT' ? user?.balances?.EUR_PROFIT?.toLocaleString() : user?.balances?.EUR?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-4xl md:text-5xl font-black italic w-full focus:outline-none placeholder:text-white/5"
                />
                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 font-black uppercase italic text-sm">
                  {fromAsset === 'PROFIT' ? 'Yield' : 'Capital'}
                </div>
              </div>
            </div>

            {/* SWAP ICON */}
            <div className="flex justify-center -my-8 relative z-10">
              <button 
                type="button"
                onClick={swapDirections}
                className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center text-black shadow-xl shadow-yellow-500/20 hover:rotate-180 transition-transform duration-500 active:scale-90"
              >
                <Repeat size={24} />
              </button>
            </div>

            {/* TO BOX */}
            <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] relative group hover:border-white/10 transition-all">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">To Ledger (Projected)</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-4xl md:text-5xl font-black italic text-gray-400">
                  {receiveAmount}
                </div>
                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 font-black uppercase italic text-sm text-yellow-500">
                  {toAsset === 'BALANCE' ? 'Capital' : 'Yield'}
                </div>
              </div>
            </div>

            {/* FEE & RATE INFO */}
            <div className="px-8 py-6 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                <span>Protocol Routing Fee</span>
                <span>1.5%</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                <span>Execution Speed</span>
                <span className="text-emerald-500">Instant</span>
              </div>
            </div>

            <button
              disabled={loading || !amount}
              className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase italic tracking-[0.3em] text-xs hover:bg-yellow-500 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>Execute Atomic Swap <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          {/* ── FOOTER NOTICE ── */}
          <div className="mt-8 bg-blue-500/5 border border-blue-500/10 p-8 rounded-[2.5rem] flex items-start gap-6">
            <Info className="text-blue-400 shrink-0" size={24} />
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Swap Liquidity Note</h4>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter leading-relaxed">
                Converting <span className="text-white">Yield</span> to <span className="text-white">Capital</span> allows you to re-invest into higher-tier nodes. All internal swaps are AES-256 encrypted and logged on the private Trustra ledger.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
