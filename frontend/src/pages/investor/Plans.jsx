import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { Zap, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const PLAN_DATA = [
  { key: 'starter', name: 'Rio Starter', roi: '6–9%', min: 100, max: 999, color: 'blue' },
  { key: 'basic', name: 'Rio Basic', roi: '9–12%', min: 1000, max: 4999, color: 'indigo' },
  { key: 'standard', name: 'Rio Standard', roi: '12–16%', min: 5000, max: 14999, color: 'purple' },
  { key: 'advanced', name: 'Rio Advanced', roi: '16–20%', min: 15000, max: 49999, color: 'amber' },
  { key: 'elite', name: 'Rio Elite', roi: '20–25%', min: 50000, max: Infinity, color: 'red' },
];

export default function Plans() {
  const { stats, fetchStats } = useUser();
  const [loading, setLoading] = useState(null);
  const [amounts, setAmounts] = useState({}); // Track custom investment amounts per card

  const handleActivate = async (plan) => {
    const investAmount = Number(amounts[plan.key] || plan.min);
    
    if (investAmount < plan.min) return toast.error(`Min requirement: €${plan.min}`);
    if (stats.balances.EUR < investAmount) return toast.error("Insufficient EUR balance. Exchange BTC first.");

    setLoading(plan.key);
    try {
      const res = await api.post('/investment/activate', { 
        planKey: plan.key, 
        amount: investAmount 
      });
      toast.success(`${plan.name} Activated Successfully`);
      fetchStats(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Node Synchronization Failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8 bg-[#020617] min-h-screen text-white">
      <header className="mb-12 text-center sm:text-left">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-2">Portfolio Expansion</p>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Rio <span className="text-slate-800">/</span> Investment Nodes</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {PLAN_DATA.map((plan) => (
          <div key={plan.key} className="bg-[#0f172a]/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col space-y-6 hover:border-indigo-500/30 transition-all backdrop-blur-xl relative overflow-hidden group">
            
            {/* Background Glow Effect */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${plan.color}-500/10 blur-[50px] rounded-full group-hover:bg-${plan.color}-500/20 transition-all`} />

            <div className="flex justify-between items-start">
              <div className={`p-3 bg-${plan.color}-500/10 rounded-2xl`}>
                <Zap className={`text-${plan.color}-400`} size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Active Schema</span>
            </div>
            
            <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white/90">{plan.name}</h3>
              <p className="text-4xl font-black mt-2 tracking-tighter text-indigo-400">{plan.roi}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Expected Monthly ROI</p>
            </div>

            <div className="space-y-4 py-6 border-y border-white/5">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Range</span>
                <span className="text-white">€{plan.min.toLocaleString()} – {plan.max === Infinity ? '∞' : `€${plan.max.toLocaleString()}`}</span>
              </div>
              
              {/* Custom Amount Input */}
              <div className="relative">
                <input 
                  type="number"
                  placeholder={`Min €${plan.min}`}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all"
                  onChange={(e) => setAmounts({ ...amounts, [plan.key]: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={() => handleActivate(plan)}
              disabled={loading === plan.key || stats.balances.EUR < plan.min}
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                stats.balances.EUR >= plan.min 
                ? 'bg-white text-black hover:bg-indigo-500' 
                : 'bg-white/5 text-slate-700 cursor-not-allowed'
              }`}
            >
              {loading === plan.key ? 'Syncing Node...' : stats.balances.EUR < plan.min ? 'Insufficient Capital' : 'Initiate Node'}
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

