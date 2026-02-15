import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api'; // Your fixed axios instance

// These IDs must match the keys in your backend config/plans.js
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

  // 1. Map Balance Check (Correctly reading from Mongoose Map)
  const availableBalance = Number(user?.balances?.EUR || 0);
  const numericAmount = Number(amount) || 0;

  // 2. Real-time ROI Calculation (Daily)
  const dailyProfit = useMemo(() => {
    if (numericAmount <= 0) return '0.00';
    // Formula: (Principal * DailyRate) / 100
    return ((numericAmount * selectedPlan.roi) / 100).toFixed(2);
  }, [numericAmount, selectedPlan]);

  const handleInvestment = async (e) => {
    e.preventDefault();
    
    // Validation Logic
    if (numericAmount < selectedPlan.min) return toast.error(`Minimum requirement: €${selectedPlan.min}`);
    if (selectedPlan.max !== Infinity && numericAmount > selectedPlan.max) return toast.error(`Maximum allowed: €${selectedPlan.max}`);
    if (numericAmount > availableBalance) return toast.error('Insufficient EUR liquidity in main wallet');

    try {
      setLoading(true);
      
      // 3. Deployment Call to Backend
      // This triggers User.js pre-save hook to set isPlanActive = true
      const res = await api.post('/plans/invest', {
        planId: selectedPlan.id,
        amount: numericAmount,
      });

      if (res.data.success) {
        toast.success(`${selectedPlan.name} Node Synchronized Successfully`, {
          style: { background: '#0f172a', color: '#fff', border: '1px solid #1e293b' }
        });
        navigate('/investments'); // Route to your SchemaLogs/Investments page
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Deployment Protocol Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500">Asset Synchronization</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Deploy <span className="text-slate-800">/</span> Node</h1>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Network Status</p>
           <p className="text-xs font-mono text-green-500">OPTIMIZED_ACTIVE</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Node Tier Selector */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {plans.map((p) => (
              <button 
                key={p.id} 
                onClick={() => setSelectedPlan(p)} 
                className={`p-5 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                  selectedPlan.id === p.id 
                    ? 'border-yellow-500 bg-yellow-500/10' 
                    : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100'
                }`}
              >
                <p className="text-[9px] font-black uppercase mb-1 tracking-tighter">{p.name}</p>
                <p className={`text-xl font-black italic ${selectedPlan.id === p.id ? 'text-yellow-500' : ''}`}>
                  {p.roi}% <span className="text-[10px] not-italic text-slate-500">/DAY</span>
                </p>
              </button>
            ))}
          </div>

          {/* Allocation Form */}
          <form onSubmit={handleInvestment} className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capital Allocation (EUR)</label>
                <button 
                  type="button" 
                  onClick={() => setAmount(availableBalance)}
                  className="text-[9px] font-bold text-yellow-600 hover:text-yellow-500 uppercase"
                >
                  Max Available
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
              <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Projected Daily ROI</p>
                <p className="text-2xl font-black text-green-500 font-mono italic">+€{dailyProfit}</p>
              </div>
              <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Wallet Liquidity</p>
                <p className="text-2xl font-black text-slate-300 font-mono">€{availableBalance.toLocaleString()}</p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-white text-black hover:bg-yellow-500 py-6 rounded-3xl font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-yellow-900/10 group disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Authorize Sync <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>}
            </button>
          </form>
        </div>

        {/* Sidebar Intelligence */}
        <aside className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
            <ShieldCheck size={40} className="text-yellow-600 mb-6" />
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Node Security Protocol</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase italic">
              Assets are managed via 2026 Rio AI-Audit. Once synchronized, capital is allocated to the high-frequency trading pool for a 30-day cycle. Principal is returned to main wallet upon completion.
            </p>
          </div>
          
          <div className="p-8 border border-yellow-900/20 bg-yellow-900/5 rounded-[2.5rem]">
             <h4 className="text-[10px] font-bold text-yellow-600 uppercase mb-2">Deployment Status</h4>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-slate-400">Validated_Node_8.4.1</span>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

