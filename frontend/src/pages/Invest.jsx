// src/pages/Invest.jsx - Production v8.4.1
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Wallet, ChevronRight, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PLAN_DATA } from '../config/plans.js'; // Fixed Import Path
import toast from 'react-hot-toast';

export default function Invest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Retrieve selected plan from location state or default to starter
  const planKey = location.state?.selectedPlan || 'starter';
  const plan = PLAN_DATA[planKey];
  
  const [amount, setAmount] = useState(plan?.min || 100);

  const handleContinue = () => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < plan.min) {
      return toast.error(`Minimum for ${plan.name} is €${plan.min}`);
    }
    
    if (numAmount > (user?.totalBalance || 0)) {
      return toast.error("Insufficient Portfolio Balance");
    }
    
    navigate('/invest-confirm', { 
      state: { planKey, amount: numAmount } 
    });
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-12 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        <button 
          onClick={() => navigate('/plans')} 
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Change Tier
        </button>

        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">Deploy Capital</h1>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1">
                {plan?.name || 'Standard'} Node
              </p>
            </div>
            <Zap className="text-indigo-500" size={32} />
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
              <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">
                <span>Available Balance</span>
                <span className="text-white">€{user?.totalBalance?.toLocaleString() || '0.00'}</span>
              </div>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-600">€</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none text-3xl font-black focus:ring-0 p-0 pl-10 text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Target ROI</p>
                <p className="text-lg font-black text-emerald-400">{plan?.roi || '6-9%'}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Cycle Duration</p>
                <p className="text-lg font-black">{plan?.durationDays || 30} Days</p>
              </div>
            </div>

            <button 
              onClick={handleContinue}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-900/40"
            >
              Review Deployment <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl italic">
          <AlertCircle size={20} className="text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-200/60 leading-relaxed uppercase font-bold">
            Audit Protocol: Capital deployed to automated nodes is locked for the cycle duration. Early termination subject to v8.4.1 liquidity constraints.
          </p>
        </div>
      </div>
    </div>
  );
}

