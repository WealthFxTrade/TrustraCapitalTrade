import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowRight, Zap, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext'; // ⚡ SYNC: Get live stats
import api from '../api/api';

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
  const { stats, fetchStats } = useUser(); // 🛡️ Actual Work: Use live balance
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Use stats balance if available, fallback to initial user object
  const availableBalance = useMemo(() => 
    Number(stats?.balances?.EUR || user?.balances?.EUR || 0), 
  [stats, user]);
  
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
            style: { background: '#020617', color: '#fff', border: '1px solid #fbbf24' }
        });
        
        // ⚡ Update global stats immediately after investment
        if (fetchStats) await fetchStats(); 
        
        navigate('/dashboard'); 
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Deployment Protocol Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 animate-in fade-in duration-700">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-yellow-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500">Capital Deployment</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Deploy <span className="text-slate-800">/</span> Node</h1>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Plan Selector Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlan(p)}
                className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                  selectedPlan.id === p.id 
                    ? 'border-yellow-500 bg-yellow-500/10 scale-[1.02]' 
                    : 'border-white/5 bg-white/5 opacity-50 hover:opacity-100'
                }`}
              >
                <p className="text-[8px] font-black uppercase mb-1 tracking-tighter text-slate-400">{p.name}</p>
                <p className={`text-lg font-black italic ${selectedPlan.id === p.id ? 'text-yellow-500' : 'text-white'}`}>
                  {p.roi}% <span className="text-[8px] not-italic text-slate-500">/DAY</span>
                </p>
              </button>
            ))}
          </div>

          {/* Main Investment Form */}
          <form onSubmit={handleInvestment} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4 px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Allocation Amount</label>
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance)}
                  className="text-[9px] font-bold text-yellow-600 hover:text-yellow-500 uppercase tracking-widest"
                >
                  Max Available: €{availableBalance.toLocaleString()}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-yellow-600 italic">€</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/60 border border-white/5 rounded-[2rem] py-8 pl-16 pr-8 text-4xl font-black outline-none focus:border-yellow-500/50 transition-all font-mono"
                />
              </div>
            </div>

            {/* Profit Estimates */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Estimated Daily Revenue</p>
                <p className="text-xl font-black text-emerald-500 font-mono tracking-tighter">+€{dailyProfit}</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Node Uptime</p>
                <p className="text-xl font-black text-blue-500 font-mono tracking-tighter">99.9%</p>
              </div>
            </div>

            <button
              disabled={loading || !amount || numericAmount < 1}
              className="w-full bg-white text-black hover:bg-yellow-500 py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Initialize Deployment <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] border-l-4 border-l-blue-500">
             <ShieldCheck className="text-blue-500 mb-4" size={28} />
             <h3 className="text-sm font-black uppercase mb-2 italic tracking-tight">Security Protocol</h3>
             <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wide">
               Capital is deployed to hardware-level trading nodes. Revenue settlement occurs every <span className="text-white">24 hours</span>.
             </p>
          </div>
          
          <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-[2rem] flex gap-4">
             <Info className="text-yellow-600 shrink-0" size={18} />
             <p className="text-[9px] text-slate-600 font-bold uppercase leading-tight tracking-wider">
               Nodes are non-custodial and locked for the duration of the operational cycle. Early liquidation is restricted.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

