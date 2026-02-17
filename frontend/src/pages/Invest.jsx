import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowRight, Zap, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/api'; // Fixed path to your unified instance

const plans = [
  { id: 'starter', name: 'Rio Starter', min: 100, max: 999, roi: 0.30, color: 'from-cyan-500/20' },
  { id: 'basic', name: 'Rio Basic', min: 1000, max: 4999, roi: 0.40, color: 'from-blue-500/20' },
  { id: 'standard', name: 'Rio Standard', min: 5000, max: 14999, roi: 0.53, color: 'from-purple-500/20' },
  { id: 'advanced', name: 'Rio Advanced', min: 15000, max: 49999, roi: 0.66, color: 'from-amber-500/20' },
  { id: 'elite', name: 'Rio Elite', min: 50000, max: Infinity, roi: 0.83, color: 'from-rose-500/20' },
];

export default function Invest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const availableBalance = Number(user?.balances?.EUR || 0);
  const numericAmount = Number(amount) || 0;

  const dailyProfit = useMemo(() => {
    if (numericAmount <= 0) return '0.00';
    return ((numericAmount * selectedPlan.roi) / 100).toFixed(2);
  }, [numericAmount, selectedPlan]);

  const handleInvestment = async (e) => {
    e.preventDefault();
    if (numericAmount < selectedPlan.min) return toast.error(`Minimum: €${selectedPlan.min}`);
    if (selectedPlan.max !== Infinity && numericAmount > selectedPlan.max) return toast.error(`Max: €${selectedPlan.max}`);
    if (numericAmount > availableBalance) return toast.error('Insufficient liquidity');

    try {
      setLoading(true);
      const res = await api.post('/plans/invest', { planId: selectedPlan.id, amount: numericAmount });
      if (res.data.success) {
        toast.success(`${selectedPlan.name} Node Synchronized`, {
            style: { background: '#0f172a', color: '#fff', border: '1px solid #1e293b' }
        });
        navigate('/dashboard'); // Adjusted to dashboard for immediate status check
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Deployment Protocol Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 max-w-7xl mx-auto animate-fade-in">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500">Asset Synchronization</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Deploy <span className="text-slate-800">/</span> Node</h1>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p)}
                className={`p-5 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                  selectedPlan.id === p.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100'
                }`}
              >
                <p className="text-[9px] font-black uppercase mb-1 tracking-tighter">{p.name}</p>
                <p className={`text-xl font-black italic ${selectedPlan.id === p.id ? 'text-yellow-500' : ''}`}>
                  {p.roi}% <span className="text-[10px] not-italic text-slate-500">/DAY</span>
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={handleInvestment} className="glass-card p-8 md:p-12 shadow-2xl border-white/5">
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capital Allocation (EUR)</label>
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance)}
                  className="text-[9px] font-bold text-yellow-600 hover:text-yellow-500 uppercase"
                >
                  Max Available: €{availableBalance.toLocaleString()}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black text-yellow-600 italic">€</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/40 border border-white/10 rounded-3xl py-10 pl-16 pr-8 text-5xl font-black outline-none focus:border-yellow-600 transition font-mono tracking-tighter"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Daily Revenue</p>
                <p className="text-2xl font-black text-emerald-500 font-mono">+€{dailyProfit}</p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Node Stability</p>
                <p className="text-2xl font-black text-blue-500">99.9%</p>
              </div>
            </div>

            <button
              disabled={loading || !amount}
              className="btn-primary w-full py-6 text-xl uppercase tracking-widest flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>Initialize Deployment <ArrowRight size={24} /></>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 border-l-4 border-l-blue-500">
             <ShieldCheck className="text-blue-500 mb-4" size={32} />
             <h3 className="text-lg font-black uppercase mb-2 italic">Secured Protocol</h3>
             <p className="text-xs text-slate-400 leading-relaxed font-bold">
               Your capital is allocated to distributed computational nodes. Revenue is indexed every 24 hours and settled in your primary EUR balance.
             </p>
          </div>
          <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl">
             <div className="flex gap-4">
                <Info className="text-yellow-600 shrink-0" size={20} />
                <p className="text-[10px] text-slate-500 font-bold uppercase leading-tight">
                  Investments are locked for the duration of the cycle. Early termination is not available for <span className="text-white">Rio Node Tiers</span>.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

