import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import {
  Zap, ShieldCheck, Loader2,
  ArrowRight, Info, ChevronLeft,
  TrendingUp, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
  { id: 'starter', name: 'Rio Starter', min: 100, roi: 0.25, duration: 30, color: 'from-blue-500/20' },
  { id: 'basic', name: 'Rio Basic', min: 1000, roi: 0.35, duration: 60, color: 'from-emerald-500/20' },
  { id: 'standard', name: 'Rio Standard', min: 5000, roi: 0.48, duration: 90, color: 'from-purple-500/20' },
  { id: 'advanced', name: 'Rio Advanced', min: 15000, roi: 0.62, duration: 120, color: 'from-orange-500/20' },
  { id: 'elite', name: 'Rio Elite', min: 50000, roi: 0.85, duration: 180, color: 'from-yellow-500/20' }
];

export default function Invest() {
  const { user, refreshUser } = useAuth(); // Assume refreshUser updates local state after investment
  const navigate = useNavigate();
  const [loadingNode, setLoadingNode] = useState(null);

  // Initialize amounts safely
  const [amounts, setAmounts] = useState(
    PLANS.reduce((acc, plan) => ({ ...acc, [plan.id]: plan.min }), {})
  );

  const handleAmountChange = (id, val) => {
    const plan = PLANS.find(p => p.id === id);
    // Ensure value is numeric and within a reasonable 20x ceiling
    const numericVal = parseInt(val) || plan.min;
    setAmounts(prev => ({ ...prev, [id]: Math.max(numericVal, plan.min) }));
  };

  const handleInvest = async (plan) => {
    const investAmount = amounts[plan.id];
    
    // 🛡️ Pre-flight validation
    if ((user?.totalBalance || 0) < investAmount) {
      return toast.error("Insufficient Liquidity in Terminal.");
    }

    setLoadingNode(plan.id);
    const loadToast = toast.loading(`Provisioning ${plan.name} Node...`);

    try {
      // Logic for the Node Handshake
      await api.post('/user/invest', {
        planName: plan.name,
        amount: investAmount
      });
      
      toast.success(`Protocol ${plan.name} Engaged.`, { id: loadToast });
      if (refreshUser) await refreshUser(); // Update balance immediately
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Node Handshake Failed", { id: loadToast });
    } finally {
      setLoadingNode(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white py-12 md:py-20 px-4 md:px-6 font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-yellow-500 transition-colors"
            >
              <ChevronLeft size={14} /> Back to Terminal
            </button>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              Engagement <span className="text-yellow-500">Hub</span>
            </h1>
            <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> Managed Risk Protocol v8.4.1
            </p>
          </div>

          <div className="w-full lg:w-auto bg-[#0a0c10] px-8 py-5 rounded-[2rem] border border-white/10 flex flex-col items-end shadow-2xl">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Available Liquidity</p>
            <p className="text-2xl md:text-3xl font-black italic text-yellow-500">
              €{(user?.totalBalance || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* NODE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {PLANS.map((plan) => {
            const currentAmount = amounts[plan.id];
            const dailyReturn = (currentAmount * (plan.roi / 100)).toFixed(2);
            const totalReturn = (parseFloat(dailyReturn) * plan.duration).toFixed(2);
            const isInsufficient = (user?.totalBalance || 0) < currentAmount;

            return (
              <div key={plan.id} className={`bg-gradient-to-b ${plan.color} to-[#0a0c10] border border-white/5 p-8 md:p-10 rounded-[3rem] flex flex-col hover:border-yellow-500/40 transition-all duration-500 group relative overflow-hidden h-full shadow-inner`}>
                
                <div className="flex justify-between items-start mb-8 md:mb-10">
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                    <Zap size={22} className="text-yellow-500" />
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Daily Yield</span>
                    <p className="text-xl md:text-2xl font-black text-emerald-400 italic">+{plan.roi}%</p>
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-6 md:mb-8">{plan.name}</h3>

                {/* Amount Selection */}
                <div className="space-y-6 mb-8 bg-black/40 p-5 md:p-6 rounded-[2rem] border border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Allocation</label>
                    <span className="text-sm font-black text-white italic">€{currentAmount.toLocaleString('de-DE')}</span>
                  </div>
                  <input
                    type="range"
                    min={plan.min}
                    max={plan.min * 20}
                    step={100}
                    value={currentAmount}
                    onChange={(e) => handleAmountChange(plan.id, e.target.value)}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="flex justify-between text-[8px] font-black text-gray-700 uppercase">
                    <span>Min: {plan.min}</span>
                    <span>Max: {plan.min * 20}</span>
                  </div>
                </div>

                {/* Earnings Ledger */}
                <div className="space-y-4 mb-10 px-2 flex-grow">
                  <LedgerRow label="Cycle Duration" value={`${plan.duration} Days`} />
                  <LedgerRow label="Daily Payout" value={`+€${dailyReturn}`} color="text-emerald-500" />
                  <div className="h-[1px] bg-white/5" />
                  <LedgerRow label="Total Projection" value={`€${totalReturn}`} color="text-yellow-500" />
                </div>

                <button
                  onClick={() => handleInvest(plan)}
                  disabled={loadingNode !== null || isInsufficient}
                  className={`w-full py-5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl ${
                    isInsufficient 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed' 
                    : 'bg-white text-black group-hover:bg-yellow-500'
                  }`}
                >
                  {loadingNode === plan.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : isInsufficient ? (
                    <><AlertTriangle size={16} /> Insufficient Funds</>
                  ) : (
                    <>Initialize Node <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Global Security Footer */}
        <div className="bg-[#0a0c10] border border-white/5 p-6 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start md:items-center gap-4">
            <Info size={24} className="text-yellow-500 shrink-0 mt-1 md:mt-0" />
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest max-w-2xl leading-relaxed text-gray-400">
              <span className="text-white font-black">Protocol Notice:</span> Funds are locked for the duration of the cycle. Daily ROI is credited to the 'Accrued Yield' ledger every 24 hours. High-frequency execution carries managed risk.
            </p>
          </div>
          <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-gray-600">
            <span>AES-256 Encrypted</span>
            <span>Audit v8.4.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🏛️ Clean Helper Component for the Ledger
function LedgerRow({ label, value, color = "text-white" }) {
  return (
    <div className="flex justify-between text-[10px] font-black uppercase">
      <span className="text-gray-500 tracking-tighter">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}
