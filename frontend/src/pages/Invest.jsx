import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeposit } from '../api';
import { ArrowLeft, TrendingUp, ShieldCheck, Wallet, ChevronRight } from 'lucide-react';
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

  // Sync plan from Dashboard selection (if user clicked a specific plan there)
  useEffect(() => {
    const planId = localStorage.getItem('selectedPlan');
    if (planId) {
      const plan = RIO_PLANS.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        localStorage.removeItem('selectedPlan'); // Clear after use
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
      // 1. We create the pending deposit record
      const res = await createDeposit({ 
        amount: numAmount, 
        planId: selectedPlan.id,
        currency: 'BTC' // Defaulting to BTC for payment
      });

      if (res.data.success) {
        toast.success(`${selectedPlan.name} initialized! Redirecting to payment...`);
        // 2. Redirect to Deposit page so they see the QR code
        navigate('/deposit', { state: { amount: numAmount, plan: selectedPlan.name } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Investment failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate profit based on highest ROI in range
  const calculateProfit = () => {
    if (!amount) return '0.00';
    const highRoi = parseFloat(selectedPlan.roi.split('–')[1]) || 0;
    return (Number(amount) * (highRoi / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 });
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
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AES-256 Protected</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-indigo-400 via-white to-slate-400 bg-clip-text text-transparent">
            Capital Allocation Nodes
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">Select a node strategy to deploy your capital into the 2026 real-time trading liquidity pool.</p>
        </div>

        {/* Plan Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {RIO_PLANS.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col ${
                selectedPlan.id === plan.id
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(79,70,229,0.1)] scale-[1.02]'
                  : 'border-slate-800 bg-slate-900/40 opacity-60 hover:opacity-100'
              }`}
            >
              <h3 className={`font-bold text-[10px] uppercase tracking-widest mb-4 ${selectedPlan.id === plan.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">{plan.roi}%</span>
                <span className="text-[10px] font-bold text-slate-500">ROI</span>
              </div>
              <div className="mt-auto space-y-1">
                <p className="text-[10px] text-slate-400 font-bold">MIN: ${plan.min.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-medium">MAX: {plan.max === Infinity ? 'UNLIMITED' : `$${plan.max.toLocaleString()}`}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Investment Execution Form */}
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>

          <form onSubmit={handleInvestment} className="space-y-8">
            <div className="flex items-center gap-4 p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50">
              <div className="p-3 bg-indigo-600/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Selected Node</p>
                <p className="font-bold text-lg">{selectedPlan.name} <span className="text-indigo-500 ml-2">~{selectedPlan.roi}%</span></p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Investment Amount</label>
                <span className="text-[10px] text-slate-600 font-mono">CURRENCY: USD</span>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">$</div>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-10 pr-4 text-white font-mono text-2xl focus:border-indigo-500 transition-all outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Profit Projection */}
            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-slate-500 font-medium">Est. Monthly Growth</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold text-lg">
                +${calculateProfit()}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Deploy Capital
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-600 font-medium">
              By deploying, you agree to the node's term duration and risk management protocols.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

