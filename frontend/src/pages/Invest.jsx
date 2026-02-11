import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Loader2, Info, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/apiService'; // ✅ Corrected to use your centralized service

const plans = [
  { name: 'Rio Starter', min: 100, max: 999, roi: 0.25, color: 'from-blue-500/20' },
  { name: 'Rio Basic', min: 1000, max: 4999, roi: 0.35, color: 'from-indigo-500/20' },
  { name: 'Rio Standard', min: 5000, max: 14999, roi: 0.46, color: 'from-purple-500/20' },
  { name: 'Rio Advanced', min: 15000, max: 49999, roi: 0.6, color: 'from-pink-500/20' },
  { name: 'Rio Elite', min: 50000, max: Infinity, roi: 0.75, color: 'from-emerald-500/20' },
];

export default function Invest() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Updated to match your 2026 backend balance structure
  const availableBalance = Number(user?.mainBalance || 0);
  const numericAmount = Number(amount) || 0;

  /* ---------- ROI CALCULATIONS ---------- */
  const dailyProfit = useMemo(() => {
    if (numericAmount <= 0) return '0.00';
    return ((numericAmount * selectedPlan.roi) / 100).toFixed(2);
  }, [numericAmount, selectedPlan]);

  const weeklyProfit = useMemo(() => {
    return (Number(dailyProfit) * 7).toFixed(2);
  }, [dailyProfit]);

  /* ---------- SUBMIT ---------- */
  const handleInvestment = async (e) => {
    e.preventDefault();

    if (numericAmount < selectedPlan.min) {
      return toast.error(`Minimum for ${selectedPlan.name} is €${selectedPlan.min.toLocaleString()}`);
    }

    if (selectedPlan.max !== Infinity && numericAmount > selectedPlan.max) {
      return toast.error(`Maximum for this tier is €${selectedPlan.max.toLocaleString()}`);
    }

    if (numericAmount > availableBalance) {
      return toast.error('Insufficient EUR balance');
    }

    try {
      setLoading(true);
      // ✅ Matches your backend transaction router
      const res = await api.post('/transactions/invest', {
        plan: selectedPlan.name,
        amount: numericAmount,
      });

      if (res.data?.success) {
        toast.success(`${selectedPlan.name} node activated`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Investment protocol failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white px-6 py-12 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
          Deploy Capital
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Available Portfolio: €{availableBalance.toLocaleString()}
          </p>
        </div>
      </header>

      {/* Plans Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {plans.map((plan) => (
          <button
            key={plan.name}
            onClick={() => setSelectedPlan(plan)}
            className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden ${
              selectedPlan.name === plan.name
                ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                : 'border-white/5 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-20`} />
            <div className="relative z-10">
              <h3 className="text-sm font-black mb-1 uppercase italic">{plan.name}</h3>
              <p className="text-xl font-black text-white">
                {plan.roi}% <span className="text-[10px] text-slate-500 italic">Daily</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Form Area */}
        <div className="lg:col-span-2 bg-[#0a0d14] border border-white/5 rounded-[3rem] p-8 md:p-10 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleInvestment} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                Allocation Amount (EUR)
              </label>
              <div className="relative">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-blue-500">€</div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/10 rounded-[2rem] py-10 pl-16 pr-8 text-4xl md:text-5xl font-black outline-none focus:border-blue-500 transition font-mono"
                />
              </div>
            </div>

            {/* ROI Forecast */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Estimated Daily ROI</p>
                <p className="text-2xl font-black text-white font-mono">+€{dailyProfit}</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Weekly Forecast</p>
                <p className="text-2xl font-black text-white font-mono">+€{weeklyProfit}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || numericAmount <= 0}
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> Deploying...</>
              ) : (
                <>Activate {selectedPlan.name} Node <ArrowRight size={20} /></>
              )}
            </button>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-4">
            <ShieldCheck className="text-blue-500 h-10 w-10" />
            <h4 className="text-lg font-black uppercase italic tracking-tighter">Secure Protocol</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Capital deployment into the Trustra Yield Nodes is protected by Audit Certified Protocol v8.4.1. 
              Funds are utilized in automated market-making and liquidity provisioning.
            </p>
          </div>
          
          <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-[2.5rem] flex gap-4">
            <Info className="text-blue-400 shrink-0" size={24} />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Active deployments are locked for 24-hour cycles. Profits are automatically credited to your main balance at 00:00 UTC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

