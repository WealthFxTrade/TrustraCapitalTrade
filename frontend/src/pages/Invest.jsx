import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeposit } from '../api';
import { ArrowLeft, TrendingUp, CheckCircle, ShieldCheck, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const RIO_PLANS = [
  { id: 'starter', name: 'Rio Starter', roi: '6–9', min: 100, max: 999 },
  { id: 'basic', name: 'Rio Basic', roi: '9–12', min: 1000, max: 4999 },
  { id: 'standard', name: 'Rio Standard', roi: '12–16', min: 5000, max: 14999 },
  { id: 'advanced', name: 'Rio Advanced', roi: '16–20', min: 15000, max: 49999 },
  { id: 'elite', name: 'Rio Elite', roi: '20–25', min: 50000, max: Infinity },
];

export default function Invest() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(RIO_PLANS[0]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync plan from Dashboard selection
  useEffect(() => {
    const planId = localStorage.getItem('selectedPlan');
    if (planId) {
      const plan = RIO_PLANS.find(p => p.id === planId);
      if (plan) setSelectedPlan(plan);
    }
  }, []);

  const handleInvestment = async (e) => {
    e.preventDefault();
    if (!amount || amount < selectedPlan.min) {
      return toast.error(`Minimum for ${selectedPlan.name} is $${selectedPlan.min.toLocaleString()}`);
    }
    if (selectedPlan.max !== Infinity && amount > selectedPlan.max) {
      return toast.error(`Maximum for ${selectedPlan.name} is $${selectedPlan.max.toLocaleString()}`);
    }

    setLoading(true);
    try {
      await createDeposit({ amount, plan: selectedPlan.id });
      toast.success(`${selectedPlan.name} investment initialized!`);
      // Optional: Navigate to a payment confirmation page or dashboard
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Investment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Protocol</span>
          </div>
        </div>

        <h2 className="text-4xl font-extrabold mb-2 text-center bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
          Select Your Strategy
        </h2>
        <p className="text-slate-500 text-center mb-12">Choose an automated ROI plan to start growing your capital.</p>

        {/* Plan Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {RIO_PLANS.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 flex flex-col ${
                selectedPlan.id === plan.id
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
                  : 'border-slate-800 bg-slate-900/40 opacity-70 hover:opacity-100'
              }`}
            >
              <h3 className={`font-bold text-sm uppercase tracking-widest mb-4 ${selectedPlan.id === plan.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">{plan.roi}%</span>
                <span className="text-[10px] font-bold text-slate-500">ROI</span>
              </div>
              <div className="mt-auto space-y-1">
                <p className="text-[10px] text-slate-500 font-bold">MIN: ${plan.min.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-bold">MAX: {plan.max === Infinity ? '∞' : `$${plan.max.toLocaleString()}`}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Investment Form */}
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
          
          <form onSubmit={handleInvestment} className="space-y-6">
            <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
              <TrendingUp className="h-6 w-6 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active Configuration</p>
                <p className="font-bold">{selectedPlan.name} — {selectedPlan.roi}% Monthly</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Deposit Amount (USD)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</div>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-10 pr-4 text-white font-mono text-xl focus:border-indigo-500 transition outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Expected Monthly Profit</span>
                <span className="text-emerald-400 font-bold">
                  +${amount ? (amount * (parseFloat(selectedPlan.roi.split('–')[1]) / 100)).toLocaleString() : '0.00'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Initialize ${selectedPlan.name}`}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">
          © 2016–2026 Trustra Capital Trade • Secure Asset Management
        </p>
      </div>
    </div>
  );
}

