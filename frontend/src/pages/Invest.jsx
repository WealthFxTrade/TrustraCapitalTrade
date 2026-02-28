// src/pages/Invest.jsx - Production v8.4.1
import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ChevronRight, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Re-using the plan data logic (ensure this matches your RIO_PLANS in Plans.jsx)
const RIO_PLANS = {
  starter: { name: 'Rio Starter', roi: '6–9%', min: 100, days: 30 },
  basic: { name: 'Rio Basic', roi: '9–12%', min: 1000, days: 45 },
  standard: { name: 'Rio Standard', roi: '12–16%', min: 5000, days: 60 },
  advanced: { name: 'Rio Advanced', roi: '16–20%', min: 15000, days: 90 },
  elite: { name: 'Rio Elite', roi: '20–25%', min: 50000, days: 120 },
};

export default function Invest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. Retrieve the plan from state (passed from Plans.jsx)
  const selectedPlanFromState = location.state?.selectedPlan;
  
  // Use either the object passed from state or find it in RIO_PLANS by key
  const plan = typeof selectedPlanFromState === 'object' 
    ? selectedPlanFromState 
    : RIO_PLANS[selectedPlanFromState || 'starter'];

  const [amount, setAmount] = useState(plan?.min || 100);

  // 2. Real-time Yield Calculation
  const estimatedYield = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    const minRoi = parseFloat(plan.roi.split('–')[0]) / 100;
    return (numAmount * minRoi).toFixed(2);
  }, [amount, plan]);

  const handleContinue = () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < plan.min) {
      return toast.error(`Minimum for ${plan.name} is €${plan.min.toLocaleString()}`);
    }

    if (numAmount > (user?.totalBalance || 0)) {
      return toast.error("Insufficient Portfolio Balance");
    }

    // Pass data to a final confirmation screen (or trigger a modal)
    navigate('/invest-confirm', {
      state: { plan, amount: numAmount, yield: estimatedYield }
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Navigation Header */}
        <button
          onClick={() => navigate('/plans')}
          className="flex items-center gap-2 text-gray-500 hover:text-yellow-500 transition-all text-[10px] font-black uppercase tracking-[0.3em]"
        >
          <ArrowLeft size={16} /> Change Tier
        </button>

        {/* Input Card */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 opacity-50" />
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">Deploy Capital</h1>
              <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest mt-1">
                {plan?.name || 'Standard'} Node Initialization
              </p>
            </div>
            <Zap className="text-yellow-500" size={32} />
          </div>

          <div className="space-y-6">
            {/* Amount Input */}
            <div className="bg-black/40 border border-white/5 p-6 rounded-2xl group focus-within:border-yellow-500/50 transition-all">
              <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">
                <span>Available Liquidity</span>
                <span className="text-white">€{user?.totalBalance?.toLocaleString() || '0.00'}</span>
              </div>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-black text-slate-600">€</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none text-4xl font-black focus:ring-0 p-0 pl-8 text-white outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Estimated Return</p>
                <p className="text-lg font-black text-emerald-400">+€{estimatedYield}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Cycle Duration</p>
                <p className="text-lg font-black text-white">{plan?.days} Days</p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleContinue}
              className="w-full py-5 bg-yellow-500 hover:bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-yellow-500/10"
            >
              Review Deployment <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Audit Disclaimer */}
        <div className="flex items-start gap-4 p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl italic">
          <AlertCircle size={20} className="text-yellow-500 shrink-0" />
          <p className="text-[10px] text-yellow-200/60 leading-relaxed uppercase font-bold">
            Audit Protocol: Capital deployed to automated nodes is locked for {plan.days} days. Node activation occurs immediately upon deployment.
          </p>
        </div>
      </div>
    </div>
  );
}
