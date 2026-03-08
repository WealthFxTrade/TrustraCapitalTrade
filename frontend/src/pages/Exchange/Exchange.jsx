// src/pages/Exchange/Exchange.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  ArrowDown, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Info,
  BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Exchange() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('0.00');
  const [isSwapping, setIsSwapping] = useState(false);
  const [rate, setRate] = useState(62450.12); // Mock BTC/EUR Rate

  // Simulated live rate fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setRate(prev => prev + (Math.random() * 20 - 10));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConvert = (val) => {
    setFromAmount(val);
    if (val) {
      setToAmount((parseFloat(val) / rate).toFixed(8));
    } else {
      setToAmount('0.00');
    }
  };

  const executeSwap = () => {
    if (!fromAmount || fromAmount <= 0) return toast.error("Enter a valid amount");
    
    setIsSwapping(true);
    toast.loading("Routing through Liquidity Pool...", { id: 'swap' });

    setTimeout(() => {
      setIsSwapping(false);
      setFromAmount('');
      setToAmount('0.00');
      toast.success("Exchange Successful", { id: 'swap', icon: '✅' });
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500 italic">Core Exchange Protocol</h2>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Currency <span className="text-white/20 not-italic font-light">Bridge</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Swap Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#05070a] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
              <RefreshCw size={120} />
            </div>

            {/* From Input */}
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                <span>Pay From Wallet</span>
                <span>Balance: €12,450.00</span>
              </div>
              <div className="flex items-center gap-4 bg-white/2 border border-white/5 p-6 rounded-3xl focus-within:border-yellow-500/50 transition-all">
                <input 
                  type="number"
                  value={fromAmount}
                  onChange={(e) => handleConvert(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-3xl font-mono font-bold outline-none w-full"
                />
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <span className="font-black italic">EUR</span>
                </div>
              </div>
            </div>

            {/* Divider Icon */}
            <div className="flex justify-center -my-4 relative z-20">
              <div className="bg-yellow-500 p-3 rounded-full shadow-xl shadow-yellow-500/20 text-black">
                <ArrowDown size={20} strokeWidth={3} />
              </div>
            </div>

            {/* To Input */}
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                <span>Receive Asset</span>
                <span>Est. Slippage: 0.02%</span>
              </div>
              <div className="flex items-center gap-4 bg-white/2 border border-white/5 p-6 rounded-3xl">
                <input 
                  type="text"
                  readOnly
                  value={toAmount}
                  className="bg-transparent text-3xl font-mono font-bold outline-none w-full text-yellow-500/50"
                />
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] text-white">₿</div>
                  <span className="font-black italic">BTC</span>
                </div>
              </div>
            </div>

            <button 
              disabled={isSwapping}
              onClick={executeSwap}
              className="w-full mt-8 py-6 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase italic tracking-[0.2em] rounded-[1.5rem] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSwapping ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
              {isSwapping ? "Finalizing..." : "Execute Exchange"}
            </button>
          </div>

          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-start gap-4">
            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80 leading-loose">
              Security Protocol: Zero-Knowledge Liquidity Swap active. Your exchange is routed through private dark-pools to ensure minimal price impact.
            </p>
          </div>
        </div>

        {/* Market Intel Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#05070a] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 italic">
              <BarChart2 size={16} className="text-yellow-500" /> Market Intel
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                <span className="text-gray-500 font-bold uppercase italic">BTC Rate</span>
                <span className="font-mono font-bold">€{rate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                <span className="text-gray-500 font-bold uppercase italic">Status</span>
                <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Highly Liquid
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold uppercase italic">Gas Fee</span>
                <span className="font-mono font-bold text-yellow-500">FREE</span>
              </div>
            </div>

            <div className="p-4 bg-white/2 rounded-2xl space-y-2">
               <div className="flex justify-between text-[8px] font-black uppercase text-gray-600">
                  <span>Pool Depth</span>
                  <span>94.2%</span>
               </div>
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '94.2%' }}
                    className="h-full bg-yellow-500"
                  />
               </div>
            </div>
          </div>

          <div className="bg-blue-600/5 border border-blue-500/10 rounded-[2rem] p-6 flex gap-4 items-center">
            <Info className="text-blue-500" size={24} />
            <p className="text-[9px] font-black uppercase text-blue-300/60 leading-tight tracking-widest">
              Conversion rates are refreshed every 3 seconds based on Zurich Mainnet spot prices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
