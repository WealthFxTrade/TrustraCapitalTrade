import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeposit } from '../api';
import { ArrowLeft, TrendingUp, ShieldCheck, Wallet, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RIO_PLANS = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9', min: 100, max: 999, color: 'text-blue-400' },
  { id: 'basic', name: 'Rio Basic', roi: '9–12', min: 1000, max: 4999, color: 'text-indigo-400' },
  { id: 'standard', name: 'Rio Standard', roi: '12–16', min: 5000, max: 14999, color: 'text-emerald-400' },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20', min: 15000, max: 49999, color: 'text-amber-400' },
  { id: 'elite', name: 'Rio Elite', roi: '20–25', min: 50000, max: Infinity, color: 'text-purple-400' },
];

export default function Invest() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(RIO_PLANS[0]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const planId = localStorage.getItem('selectedPlan');
    if (planId) {
      const plan = RIO_PLANS.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        localStorage.removeItem('selectedPlan');
      }
    }
  }, []);

  const handleInvestment = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!amount || numAmount < selectedPlan.min) {
      return toast.error(`Minimum for ${selectedPlan.name} is $${selectedPlan.min.toLocaleString()}`);
    }
    if (selectedPlan.max !== Infinity && numAmount > selectedPlan.max) {
      return toast.error(`Maximum for ${selectedPlan.name} is $${selectedPlan.max.toLocaleString()}`);
    }

    setLoading(true);
    try {
      const res = await createDeposit({
        amount: numAmount,
        planId: selectedPlan.id,
        currency: 'BTC'
      });

      // Handling both direct data and nested axios data
      const success = res.success || res.data?.success;
      
      if (success) {
        toast.success(`${selectedPlan.name} initialized!`);
        navigate('/deposit', { state: { amount: numAmount, plan: selectedPlan.name } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Investment failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfit = () => {
    if (!amount) return '0.00';
    const highRoi = parseFloat(selectedPlan.roi.split('–')[1]) || 0;
    return (Number(amount) * (highRoi / 100)).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition" />
            <span className="font-medium text-sm">Dashboard</span>
          </button>
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AES-256 Protected</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-indigo-400 via-white to-slate-400 bg-clip-text text-transparent">
            Capital Allocation Nodes
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">Select a strategy to deploy liquidity into 2026 automated nodes.</p>
        </div>

        {/* Plan Selection Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-12">
          {RIO_PLANS.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col ${
                selectedPlan.id === plan.id
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-xl shadow-indigo-900/20'
                  : 'border-slate-800 bg-slate-900/40 opacity-60 hover:opacity-100'
              }`}
            >
              <h3 className={`font-bold text-[9px] uppercase tracking-widest mb-3 ${selectedPlan.id === plan.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold">{plan.roi}%</span>
                <span className="text-[9px] font-bold text-slate-500">ROI</span>
              </div>
              <div className="mt-auto">
                <p className="text-[9px] text-slate-400 font-bold uppercase">Min: ${plan.min.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Execution Form */}
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative">
          <form onSubmit={handleInvestment} className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              <div className="p-3 bg-indigo-600/10 rounded-xl">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Selector</p>
                <p className="font-bold text-slate-100">{selectedPlan.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Amount (USD)</label>
                <span className="text-[10px] text-indigo-400 font-mono">Limit: ${selectedPlan.min}+</span>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-8 pr-4 text-xl font-mono focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Profit Calculator View */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Estimated Monthly ROI</p>
                <p className="text-xl font-black text-emerald-400 font-mono">${calculateProfit()}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-500 uppercase">Risk Level</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Low-Volatility</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-sm tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/30 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>DEPLOY CAPITAL <ChevronRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

