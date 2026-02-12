import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Loader2, ArrowRight, Zap, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const plans = [
  { id: 'starter', name: 'Rio Starter', min: 100, max: 999, roi: 0.25, color: 'from-cyan-500/20' },
  { id: 'basic', name: 'Rio Basic', min: 1000, max: 4999, roi: 0.35, color: 'from-blue-500/20' },
  { id: 'standard', name: 'Rio Standard', min: 5000, max: 14999, roi: 0.46, color: 'from-purple-500/20' },
  { id: 'advanced', name: 'Rio Advanced', min: 15000, max: 49999, roi: 0.6, color: 'from-amber-500/20' },
  { id: 'elite', name: 'Rio Elite', min: 50000, max: Infinity, roi: 0.75, color: 'from-rose-500/20' },
];

export default function Invest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ FIXED: Matches backend balances.get('EUR')
  const availableBalance = Number(user?.balances?.EUR || 0);
  const numericAmount = Number(amount) || 0;

  const dailyProfit = useMemo(() => {
    if (numericAmount <= 0) return '0.00';
    return ((numericAmount * selectedPlan.roi) / 100).toFixed(2);
  }, [numericAmount, selectedPlan]);

  const handleInvestment = async (e) => {
    e.preventDefault();
    if (numericAmount < selectedPlan.min) return toast.error(`Min €${selectedPlan.min}`);
    if (selectedPlan.max !== Infinity && numericAmount > selectedPlan.max) return toast.error(`Max €${selectedPlan.max}`);
    if (numericAmount > availableBalance) return toast.error('Insufficient EUR balance');

    try {
      setLoading(true);
      // ✅ FIXED: Matches app.use('/api/plans', planRoutes)
      const res = await api.post('/plans/invest', {
        planId: selectedPlan.id,
        amount: numericAmount,
      });

      if (res.data.success) {
        toast.success(`${selectedPlan.name} Node Online`);
        navigate('/investments'); // Go to Schema Logs after buying
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Protocol Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-blue-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Capital Deployment</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Deploy <span className="text-slate-700">/</span> Schema</h1>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Plan Selector */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {plans.map((p) => (
              <button key={p.id} onClick={() => setSelectedPlan(p)} className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${selectedPlan.id === p.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 opacity-50'}`}>
                <p className="text-[9px] font-black uppercase mb-1">{p.name}</p>
                <p className="text-lg font-black italic">{p.roi}%</p>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleInvestment} className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] p-8 md:p-10">
            <div className="mb-8">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-4">Allocation Amount (EUR)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-blue-500 italic">€</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-2xl py-8 pl-14 pr-6 text-4xl font-black outline-none focus:border-blue-500 transition font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Daily ROI</p>
                <p className="text-xl font-black text-emerald-400 font-mono">€{dailyProfit}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Available</p>
                <p className="text-xl font-black text-gray-300 font-mono">€{availableBalance.toLocaleString()}</p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition shadow-xl shadow-blue-900/20">
              {loading ? <Loader2 className="animate-spin" /> : <>Authorize Node Sync <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <aside className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 h-fit">
           <ShieldCheck size={32} className="text-blue-500 mb-6" />
           <h3 className="text-sm font-black uppercase tracking-widest mb-4">Compliance Protocol</h3>
           <p className="text-xs text-gray-500 leading-relaxed font-medium uppercase italic">
             Assets are managed via 2026 Rio AI-Audit. Once synchronized, capital is locked for the duration of the schema.
           </p>
        </aside>
      </div>
    </div>
  );
}

